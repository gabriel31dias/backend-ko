import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const paymentMethods = ['pix', 'card'];
const statuses = ['pending', 'waiting', 'approved', 'rejected'];
const customerTypes = ['pf', 'pj'];

const customerNames = [
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Lima',
  'Fernanda Souza', 'Rafael Pereira', 'Juliana Ferreira', 'Lucas Almeida', 'Camila Rodrigues',
  'Bruno Martins', 'Larissa Gomes', 'Thiago Barbosa', 'Priscila Ribeiro', 'Felipe Carvalho',
  'Vanessa Araújo', 'Gustavo Moreira', 'Tatiana Dias', 'Diego Torres', 'Renata Cardoso',
  'Empresa Tech Ltda', 'Inovação Digital EIRELI', 'Soluções Web S/A', 'Comércio Online Ltda',
  'Marketplace Brasil EIRELI', 'E-commerce Plus S/A', 'Digital Store Ltda', 'Tech Solutions EIRELI'
];

const cities = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
  'Curitiba', 'Recife', 'Porto Alegre', 'Manaus', 'Belém'
];

const states = ['SP', 'RJ', 'MG', 'BA', 'DF', 'PR', 'PE', 'RS', 'AM', 'PA'];

const descriptions = [
  'Venda de produto digital',
  'Curso online',
  'E-book',
  'Consultoria',
  'Software subscription',
  'Produto físico',
  'Serviço de design',
  'Mentoria',
  'Coaching',
  'Dropshipping'
];

function generateRandomCPF(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const firstDigit = 11 - (sum % 11);
  digits.push(firstDigit >= 10 ? 0 : firstDigit);
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  const secondDigit = 11 - (sum % 11);
  digits.push(secondDigit >= 10 ? 0 : secondDigit);
  
  return digits.join('');
}

function generateRandomCNPJ(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  
  // Calcular primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  const firstDigit = 11 - (sum % 11);
  digits.push(firstDigit >= 10 ? 0 : firstDigit);
  
  // Calcular segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  const secondDigit = 11 - (sum % 11);
  digits.push(secondDigit >= 10 ? 0 : secondDigit);
  
  return digits.join('');
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'uol.com.br'];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${cleanName}${randomNum}@${getRandomItem(domains)}`;
}

function getRandomDateInLast30Days(): Date {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime);
}

async function main() {
  console.log('🔍 Buscando usuários existentes...');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true
    }
  });
  
  if (users.length === 0) {
    console.error('❌ Nenhum usuário encontrado no banco! Crie alguns usuários primeiro.');
    process.exit(1);
  }
  
  console.log(`✅ Encontrados ${users.length} usuários`);
  console.log('🚀 Gerando 1000 transações...');
  
  const transactions = [];
  
  for (let i = 0; i < 1000; i++) {
    const customerType = getRandomItem(customerTypes);
    const customerName = getRandomItem(customerNames);
    const paymentMethod = getRandomItem(paymentMethods);
    const status = getRandomItem(statuses);
    const amount = Math.floor(Math.random() * 100000) / 100; // R$ 0,01 a R$ 999,99
    const createdAt = getRandomDateInLast30Days();
    const city = getRandomItem(cities);
    const state = getRandomItem(states);
    
    const transaction = {
      amount,
      paymentMethod,
      status,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: getRandomItem(descriptions),
      customerName,
      customerEmail: generateRandomEmail(customerName),
      customerPhone: `11${Math.floor(Math.random() * 900000000) + 100000000}`,
      customerDocument: Math.random() > 0.5 ? generateRandomCPF() : null,
      customerType,
      customerTaxId: customerType === 'pf' ? generateRandomCPF() : generateRandomCNPJ(),
      customerStreet: `Rua ${Math.floor(Math.random() * 9999)} de ${getRandomItem(['Janeiro', 'Maio', 'Setembro'])}`,
      customerNumber: Math.floor(Math.random() * 9999).toString(),
      customerComplement: Math.random() > 0.7 ? `Apto ${Math.floor(Math.random() * 200)}` : null,
      customerNeighborhood: `Bairro ${getRandomItem(['Centro', 'Vila Nova', 'Jardim', 'Alto'])}`,
      customerCity: city,
      customerState: state,
      customerZipCode: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
      receiverUserId: getRandomItem(users).id,
      createdAt,
      approvedAt: status === 'approved' ? new Date(createdAt.getTime() + Math.random() * 60000) : null,
      expiresAt: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 dias
      // PIX
      pixCode: paymentMethod === 'pix' ? `00020126330014BR.GOV.BCB.PIX${Math.random().toString(36).substr(2, 8)}` : null,
      pixQrCode: paymentMethod === 'pix' ? `https://mock-qrcode.com/${Math.random().toString(36).substr(2, 8)}` : null,
      pixExpiresAt: paymentMethod === 'pix' ? new Date(createdAt.getTime() + 30 * 60 * 1000) : null,
      // Card
      authorizationCode: paymentMethod === 'card' && status === 'approved' ? `AUTH_${Math.random().toString(36).substr(2, 10).toUpperCase()}` : null,
      nsu: paymentMethod === 'card' && status === 'approved' ? `NSU_${Math.floor(Math.random() * 1000000)}` : null,
      // Fees (apenas para transações aprovadas)
      grossAmount: status === 'approved' ? amount : null,
      fixedFeeApplied: status === 'approved' ? Math.floor(Math.random() * 300) / 100 : null, // R$ 0,00 a R$ 2,99
      percentageFeeApplied: status === 'approved' ? Math.floor(Math.random() * 500) / 100 : null, // 0% a 4.99%
      totalFeesApplied: null, // Will calculate
      netAmount: null, // Will calculate
    };
    
    // Calculate fees for approved transactions
    if (status === 'approved' && transaction.fixedFeeApplied && transaction.percentageFeeApplied) {
      const percentageFeeAmount = (amount * transaction.percentageFeeApplied) / 100;
      transaction.totalFeesApplied = transaction.fixedFeeApplied + percentageFeeAmount;
      transaction.netAmount = Math.max(0, amount - transaction.totalFeesApplied);
    }
    
    transactions.push(transaction);
    
    if ((i + 1) % 100 === 0) {
      console.log(`📝 Geradas ${i + 1} transações...`);
    }
  }
  
  console.log('💾 Inserindo transações no banco...');
  
  // Insert in batches of 50 to avoid potential issues
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await prisma.transaction.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`✅ Inseridas ${Math.min(i + batchSize, transactions.length)} / 1000 transações`);
  }
  
  console.log('🎉 1000 transações criadas com sucesso!');
  
  // Show summary
  const summary = await prisma.transaction.groupBy({
    by: ['status', 'paymentMethod'],
    _count: {
      _all: true
    },
    _sum: {
      amount: true
    }
  });
  
  console.log('\n📊 Resumo das transações criadas:');
  summary.forEach(item => {
    console.log(`${item.status.toUpperCase()} - ${item.paymentMethod.toUpperCase()}: ${item._count._all} transações, Total: R$ ${(item._sum.amount || 0).toFixed(2)}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar transações:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });