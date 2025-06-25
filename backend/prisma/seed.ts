import { PrismaClient, TicketType, TicketStatus, Priority } from '@prisma/client';
import { subDays, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Frontend Team',
        description: 'Responsible for UI/UX development'
      }
    }),
    prisma.team.create({
      data: {
        name: 'Backend Team',
        description: 'API and server-side development'
      }
    }),
    prisma.team.create({
      data: {
        name: 'DevOps Team',
        description: 'Infrastructure and deployment'
      }
    })
  ]);

  console.log('✅ Created teams');

  // Create team members
  const members = [];
  for (const team of teams) {
    const teamMembers = await Promise.all([
      prisma.member.create({
        data: {
          name: `${team.name.split(' ')[0]} Developer 1`,
          email: `dev1-${team.name.toLowerCase().replace(' ', '-')}@company.com`,
          role: 'Senior Developer',
          teamId: team.id
        }
      }),
      prisma.member.create({
        data: {
          name: `${team.name.split(' ')[0]} Developer 2`,
          email: `dev2-${team.name.toLowerCase().replace(' ', '-')}@company.com`,
          role: 'Developer',
          teamId: team.id
        }
      }),
      prisma.member.create({
        data: {
          name: `${team.name.split(' ')[0]} Lead`,
          email: `lead-${team.name.toLowerCase().replace(' ', '-')}@company.com`,
          role: 'Team Lead',
          teamId: team.id
        }
      })
    ]);
    members.push(...teamMembers);
  }

  console.log('✅ Created team members');

  // Create sprints
  const sprints = [];
  for (const team of teams) {
    for (let i = 0; i < 5; i++) {
      const startDate = subDays(new Date(), (i + 1) * 14);
      const endDate = addDays(startDate, 13);
      
      const sprint = await prisma.sprint.create({
        data: {
          name: `Sprint ${5 - i}`,
          startDate,
          endDate,
          teamId: team.id,
          velocity: Math.floor(Math.random() * 30) + 20
        }
      });
      sprints.push(sprint);
    }
  }

  console.log('✅ Created sprints');

  // Create tickets
  const ticketTypes = [TicketType.FEATURE, TicketType.BUG, TicketType.TASK];
  const ticketStatuses = [TicketStatus.TODO, TicketStatus.IN_PROGRESS, TicketStatus.IN_REVIEW, TicketStatus.DONE];
  const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL];

  for (const team of teams) {
    const teamMembers = members.filter(m => m.teamId === team.id);
    const teamSprints = sprints.filter(s => s.teamId === team.id);

    for (let i = 0; i < 50; i++) {
      const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
      const status = ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const assignee = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      const sprint = teamSprints[Math.floor(Math.random() * teamSprints.length)];
      
      const createdAt = subDays(new Date(), Math.floor(Math.random() * 60));
      const resolvedAt = status === TicketStatus.DONE 
        ? addDays(createdAt, Math.floor(Math.random() * 10) + 1)
        : null;

      await prisma.ticket.create({
        data: {
          title: `${ticketType} - ${team.name} Task ${i + 1}`,
          description: `Description for ${ticketType.toLowerCase()} ticket in ${team.name}`,
          type: ticketType,
          status,
          priority,
          storyPoints: Math.floor(Math.random() * 8) + 1,
          estimatedHours: Math.floor(Math.random() * 16) + 2,
          actualHours: status === TicketStatus.DONE ? Math.floor(Math.random() * 20) + 1 : null,
          createdAt,
          resolvedAt,
          teamId: team.id,
          assigneeId: assignee.id,
          sprintId: sprint.id
        }
      });
    }
  }

  console.log('✅ Created tickets');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });