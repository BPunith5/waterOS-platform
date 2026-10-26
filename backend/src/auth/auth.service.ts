import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  private get mailer() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private signToken(user: UserDocument): string {
    return this.jwtService.sign({ sub: user._id.toString(), role: user.role });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.usersService.create({ ...dto, role: 'user' });
    return { token: this.signToken(user), user: user.toJSON() };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+otp +otpExpiry')
      .exec();

    if (!user) {
      throw new UnauthorizedException('No account found with that email');
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.userModel.updateOne(
      { _id: user._id },
      { otp, otpExpiry },
    );

    await this.mailer.sendMail({
      from: `"Aqua Nigha" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: 'Your Aqua Nigha login OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#01040F;color:#fff;border-radius:12px">
          <h2 style="color:#4DE8E6;margin-bottom:8px">Aqua Nigha</h2>
          <p style="color:#94a3b8;margin-bottom:24px">Your one-time login code</p>
          <div style="background:#0a1628;border:1px solid #1e3a5f;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:bold;color:#4DE8E6">
            ${otp}
          </div>
          <p style="color:#64748b;margin-top:24px;font-size:13px">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    return { message: 'OTP sent to your email', email: user.email };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+otp +otpExpiry')
      .exec();

    if (!user || !user.otp || !user.otpExpiry) {
      throw new UnauthorizedException('No OTP requested');
    }

    if (new Date() > user.otpExpiry) {
      throw new UnauthorizedException('OTP expired');
    }

    if (user.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpiry: 1 } },
    );

    const fullUser = await this.usersService.findByEmail(user.email);
    return { token: this.signToken(fullUser!), user: fullUser!.toJSON() };
  }
}
