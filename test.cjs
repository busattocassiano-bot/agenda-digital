const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:5173/agenda');
  await page.waitForSelector('.sidebar', { timeout: 5000 });
  
  // Find Não Cadastrado
  const elements = await page.$$('div');
  let clicked = false;
  for (const el of elements) {
    const text = await page.evaluate(el => el.textContent, el);
    if (text && text.includes('Não Cadastrado')) {
      await el.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    console.log("Could not find Não Cadastrado event");
  } else {
    // Wait for the popup menu to appear
    await new Promise(r => setTimeout(r, 500));
    // Find Avaliação Completa
    const buttons = await page.$$('button');
    let btnClicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Avaliação Completa')) {
        console.log("Clicking Avaliação Completa...");
        await btn.click();
        btnClicked = true;
        break;
      }
    }
    if (!btnClicked) console.log("Button not found");
    
    // Wait for modal to render or error
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
})();
