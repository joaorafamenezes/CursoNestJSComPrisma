import { HashServiceProtocol } from './hashing.service';
import * as bcrypt from 'bcryptjs';   

export class BcryptService implements HashServiceProtocol {
    async hash(password: string): Promise<string> {
        //implementar a lógica para retornar a senha hasheada com bcrypt
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        //implementar a lógica para comparar a senha com o hash usando bcrypt
        return bcrypt.compare(password, hashedPassword);
    }

}