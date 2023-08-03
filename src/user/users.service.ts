import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { IUser } from './interface/users.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-users.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModule: Model<IUser>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<IUser> {
    const { password } = createUserDto;
    const user = await this.userModule.findOne({ email: createUserDto.email });
    if (user) {
      throw new ConflictException('Email in use');
    }
    const saltOrRounds = 10;
    const hashpassword = await bcrypt.hash(password, saltOrRounds);
    const newUser = await new this.userModule({
      ...createUserDto,
      password: hashpassword,
    });
    return newUser.save();
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { password } = loginUserDto;

    const user = await this.userModule.findOne({ email: loginUserDto.email });
    if (!user) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new UnauthorizedException('Email or password is wrong');
    }

    const payload = {
      id: user._id,
    };

    const token = this.jwtService.sign(payload);
    await this.userModule.findByIdAndUpdate(user._id, { token });
    return {
      token,
      user: {
        email: user.email,
      },
    };
  }

  async getUsers() {
    const users = await this.userModule.find().exec();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  delete(id: number) {
    return `This action delete a #${id} user`;
  }
}
