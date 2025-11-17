//uma classe abstrata, apenas para servir um contrato para as classes filhas
export abstract class HashServiceProtocol {
    abstract hash(password: string): Promise<string>;

    abstract compare(password: string, hashedPassword: string): Promise<boolean>;
}