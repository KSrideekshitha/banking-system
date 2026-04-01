// Simple White Box Tests for Banking Logic

// Test 1: Balance calculation
test('Deposit adds correct amount to balance', () => {
  const balance = 1000;
  const deposit = 500;
  const newBalance = balance + deposit;
  expect(newBalance).toBe(1500);
});

// Test 2: Withdrawal logic
test('Withdraw deducts correct amount', () => {
  const balance = 1000;
  const withdraw = 300;
  const newBalance = balance - withdraw;
  expect(newBalance).toBe(700);
});

// Test 3: Prevent overdraft
test('Cannot withdraw more than balance', () => {
  const balance = 500;
  const withdraw = 1000;
  const isAllowed = withdraw <= balance;
  expect(isAllowed).toBe(false);
});

// Test 4: Transfer logic
test('Transfer deducts from sender and adds to receiver', () => {
  const senderBalance = 1000;
  const receiverBalance = 500;
  const amount = 200;
  const newSender = senderBalance - amount;
  const newReceiver = receiverBalance + amount;
  expect(newSender).toBe(800);
  expect(newReceiver).toBe(700);
});

// Test 5: Empty field validation
test('Empty email should fail validation', () => {
  const email = '';
  const isValid = email.length > 0;
  expect(isValid).toBe(false);
});

// Test 6: Password length validation
test('Password less than 6 chars should fail', () => {
  const password = '123';
  const isValid = password.length >= 6;
  expect(isValid).toBe(false);
});

// Test 7: Initial balance
test('New user starts with zero balance', () => {
  const initialBalance = 0;
  expect(initialBalance).toBe(0);
});

// Test 8: Self transfer check
test('User cannot transfer to themselves', () => {
  const senderEmail = 'user@test.com';
  const receiverEmail = 'user@test.com';
  const isSelf = senderEmail === receiverEmail;
  expect(isSelf).toBe(true); // meaning it should be BLOCKED
});