import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver, UseMiddleware} from 'type-graphql'
import { compare, hash } from 'bcryptjs'
import { User } from './entity/User'
import { MyContext } from './MyContext'
import { createAccessToken, createRefreshToken } from './auth'
import { isAuth } from './isAuth'


@ObjectType()
export class LoginResponse{
    @Field()
    accessToken: String
}
@Resolver()
export class UserResolver{
 
    @Query(()=> [User])
    hello() {
        return User.find();
    }

    @UseMiddleware(isAuth)
    @Query(() => String)
    bye(
        @Ctx() {payload}: MyContext
    ){
        return `Your id is ${payload?.userId}`;
    }

    @Mutation(()=> LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() {res}: MyContext 
    ): Promise<LoginResponse>{
        const user = await User.findOne({where: {email}})
        if(!user){
            throw new Error('User not found');
        }

        const valid = await compare(password,user.password)
        if(!valid){
            throw new Error('Incorrect password')
        }

        res.cookie('jid',createRefreshToken(user),{httpOnly: true})

        return {
            accessToken: createAccessToken(user)
        }

    }

    @Mutation(()=> Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string,
    ){
        const hashedPassword = await hash(password,12);
        try{
            await User.insert(
                {
                    email,
                    password: hashedPassword
                }
            )
        }
        catch(err){
            console.log(err)
            return false;
        }
        return true;
    }
}