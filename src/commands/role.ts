import { Message, Role } from 'discord.js';
import Command from 'src/libs/command';

type RoleList = {
    [key: string]: string;
};

class RoleCMD extends Command {
    constructor() {
        super({
            name: 'role',
            aliases: [''],
            description: 'Command to give yourself a role'
        });
    }

    // Usage for invalid command
    private invalidCMD(message: Message): void {
        const embedObj = {
            title: 'Role Commands',
            description: 'Get a user role.',
            color: '#e53935',
            fields: [
                {
                    name: '**Usage Example: **',
                    value: '```ab role [role]``````buddie role [role]```'
                },
                {
                    name: '**Flags: **',
                    value: 'This command accepts the following flags. \n \n'
                },
                {
                    name: '`--multi`',
                    value: 'Assign multiple role at once. \n'
                }
            ]
        };

        message.channel.send({ embed: embedObj });
    }

    public execute(message: Message, args: string[]): void {
        const first = args.shift();

        let reqRoles: Array<string> = [];

        // Check for flags
        if (first === '--multi') {
            if (args.length === 0) {
                this.invalidCMD(message);
                return;
            }

            reqRoles = args;
        } else {
            // Single role
            if (first === undefined) {
                this.invalidCMD(message);
                return;
            }

            reqRoles = [first];
        }

        const guild = message.guild;

        const member = guild?.member(message.author);

        const bot = guild?.client.user;

        // Get bot role position
        let botHighestPosition = 0;
        if (bot !== undefined && bot !== null) {
            const botRole = guild?.member(bot)?.roles.highest;
            if (botRole !== undefined) {
                botHighestPosition = botRole.rawPosition;
            }
        }

        // List of guild roles
        const roleList: RoleList = {};
        guild?.roles.cache.forEach((role: Role) => {
            if (botHighestPosition > role.rawPosition)
                roleList[role.name.toLowerCase()] = role.id;
        });

        // Assign roles
        const invalidRoles: Array<string> = [];
        const roles: Array<string> = [];

        reqRoles.forEach((r: string) => {
            const role = roleList[r.toLowerCase()];
            if (role !== undefined) {
                roles.push(role);
            } else {
                invalidRoles.push(r);
            }
        });

        member?.roles.add(roles);

        if (invalidRoles.length > 0) {
            message.channel.send(
                `Couldn't find the following role(s): ${invalidRoles}`
            );
        }
    }
}

export default RoleCMD;