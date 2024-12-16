const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3030');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Le jeu du pendu");
});

test('test button', async ({ page }) => {
    await page.goto('http://localhost:3030');

  await page.click('button:has-text("Tester")');
  await page.click('button:has-text("Afficher les meilleurs joueurs")')

})

test('test letter', async ({ page }) => {
    await page.goto('http://localhost:3030');

    await page.getByRole('textbox').fill('a');

  // Expect a title "to contain" a substring.
  await page.click('button:has-text("Tester")');
  
  const lettersTriedElement = await page.waitForSelector('p:has-text("Lettres essayées :")', { state: 'visible' });
  const text = await lettersTriedElement.innerText();
  const a = await expect(text).toContain('a');// Vérifier que la lettre 'a' est présente dans le texte
  if(a){
    console.log('L\'élément :', text, 'est présent');
  }
})