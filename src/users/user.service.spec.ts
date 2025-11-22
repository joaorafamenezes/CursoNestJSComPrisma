/**
 *  Testes unistários para o serviço de usuários.
 *  Testes de ponta a ponta (e2e)
 *  AAA
 *   > Configurção do teste (Arrange)
 *   > Algo que deseja fazer a ação (Act)
 *   > Conferir se a ação foi esperada (Assert)
 * 
 */

import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "./users.service"
import { HashServiceProtocol } from '../auth/hash/hashing.service';
import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserDto } from "./dto/create-user.dto";
import { HttpException, HttpStatus } from "@nestjs/common";

describe('UserService', () => {
    let userService: UsersService;
    let prismaService: PrismaService;
    let hashingService: HashServiceProtocol;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            create: jest.fn().mockResolvedValue({
                                id: 1,
                                email: 'teste001@teste.com',
                                name: 'Teste 001'
                            }),
                            findFirst: jest.fn()
                        }
                    }
                },
                {
                    provide: HashServiceProtocol,
                    useValue: {
                        hash: jest.fn()
                    }
                }

            ]
        }).compile();

        userService = module.get<UsersService>(UsersService);
        prismaService = module.get<PrismaService>(PrismaService);
        hashingService = module.get<HashServiceProtocol>(HashServiceProtocol); 

    })
    it('should be defined users service', () => {
        console.log(userService);
        expect(userService).toBeDefined();
    })

    it('should create a new user', async () => {
        // Preciso criar um createUserDto [X]
        // Preciso do hashingService tenha o método hash
        // Verificar se o hasingservice foi chamado com o parametro createUserDto.password
        // Verificar se prisma user create foi chamado
        // O retorno deve ser o novo usuario criado com sucesso

        const createUserDto: CreateUserDto = {
            email: 'teste001@teste.com',
            name: 'Teste 001',
            passwordHash: '123456',
            avatar: ''
        }
    
        jest.spyOn(hashingService, 'hash').mockResolvedValue('HASH_MOCK_EXEMPLO');

        const result = await userService.create(createUserDto);

        expect(hashingService.hash).toHaveBeenCalled();
        expect(prismaService.user.create).toHaveBeenCalledWith({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                passwordHash: 'HASH_MOCK_EXEMPLO',
                createdAt: expect.any(Date)
            },
            select: {
                id: true,
                name: true, 
                email: true,
            }
        });

        expect(result).toEqual({
            id: 1,
            email: 'teste001@teste.com',
            name: 'Teste 001'
        });
    })

    it('should return a user when founded', async () => {
        // Preciso mockar o prismaService.user.findUnique
        // Chamar o método findOne do userService
        // Verificar se o retorno é o usuário esperado

        const mockUser = {
            id: 1,
            name: 'Teste 001',
            email: 'teste@teste.com',
            avatar: null,
            Task: [],            
            passwordHash: 'HASH_MOCK_EXEMPLO',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);        

        const result = await userService.findOne(1);
        
        expect(prismaService.user.findFirst).toHaveBeenCalledWith({
            where: { id: 1 },
            select: {
                id: true,
                name: true,
                email: true,
                Task: true,
                avatar: true
            }
        });

        expect(result).toEqual(mockUser);

    })  

    it('shoul throw error exception when user not found', async () => {
        // Preciso mockar o prismaService.user.findUnique para retornar null
        // Chamar o método findOne do userService
        // Verificar se lança a exceção de usuário não encontrado

        jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

        await expect(userService.findOne(999)).rejects.toThrow(
            new HttpException('Usuário não encontrado!', HttpStatus.BAD_REQUEST)
        );

        expect(prismaService.user.findFirst).toHaveBeenCalledWith({
            where: { id: 999 },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                Task: true
            }
        });
    })
})