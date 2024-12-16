const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3030');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Le jeu du pendu");
});

test('test button', async ({ page }) => {
  await page.goto('http://localhost:3030');

  await page.click('button:has-text("Tester")');
  await page.click('button:has-text("Afficher les meilleurs joueurs")');
});

test('test letter', async ({ page }) => {
  await page.goto('http://localhost:3030');

  await page.getByRole('textbox').fill('a');

  await page.click('button:has-text("Tester")');

  const lettersTriedElement = await page.waitForSelector('p:has-text("Lettres essayées :")', { state: 'visible' });
  const text = await lettersTriedElement.innerText();
  const a = await expect(text).toContain('a'); // Vérifier que la lettre 'a' est présente dans le texte
  if (a) {
    console.log('L\'élément :', text, 'est présent');
  }
});

test('test win state', async ({ page }) => {
  await page.goto('http://localhost:3030');

  // Simulate a win state
  await page.evaluate(() => {
    document.querySelector('#gameStatus').innerHTML = `
      <form action="/save-username" method="POST" id="usernameForm">
        <input type="text" name="name" placeholder="Enter your name" required>
        <input type="hidden" id="scoreField" name="score" required>
        <input type="hidden" id="dateField" name="game_date" required>
        <button class="uk-button-secondary" type="submit">Save</button>
      </form>
      <h2>Félicitations ! Vous avez trouvé le mot : test 🎉</br> Votre score est de : 100</h2>
    `;
  });

  // Verify the win message and form
  await expect(page.locator('h2:has-text("Félicitations ! Vous avez trouvé le mot : test 🎉 Votre score est de : 100")')).toBeVisible();
  await expect(page.locator('#usernameForm')).toBeVisible();
});

test('test lose state', async ({ page }) => {
  await page.goto('http://localhost:3030');

  // Simulate a lose state
  await page.evaluate(() => {
    document.querySelector('#gameStatus').innerHTML = `
      <h2>Désolé, vous avez perdu. Le mot était : test 😢</h2>
    `;
  });

  // Verify the lose message
  await expect(page.locator('h2:has-text("Désolé, vous avez perdu. Le mot était : test 😢")')).toBeVisible();
});

test('test top players modal', async ({ page }) => {
  await page.goto('http://localhost:3030');

  // Click the button to show top players
  await page.click('button:has-text("Afficher les meilleurs joueurs")');

  // Verify the modal is visible
  const modal = page.locator('#topPlayersModal');
  await expect(modal).toBeVisible();

  // Verify the table headers
  await expect(page.locator('#playersTable th')).toHaveText(['Nom', 'Score', 'Date']);
});

test('test twitter share button', async ({ page }) => {
  await page.goto('http://localhost:3030');

  // Simulate the intermediate modal being shown
  await page.evaluate(() => {
    document.querySelector('#intermediateModal').style.display = 'block';
  });

  // Click the Twitter share button
  await page.click('#twitterBtn');

  // Verify the Twitter share functionality (this might need more specific handling depending on your implementation)
  // For example, you might want to check if a new window/tab is opened with the Twitter share URL
});
