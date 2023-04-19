const { CronJob } = require("cron");
const puppeteer = require("puppeteer");
require("dotenv").config();

const url = "https://centralrelacionamento.sescsp.org.br/?path=agendamentos";

const agendaSesc = () => {
  (async () => {
    
    const browser = await puppeteer.launch({ headless: false }); // it code serve to see executing page
    //const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1024,
      height: 800,
      deviceScaleFactor: 1,
    });
    await page.goto(url);

    try {

      console.log("Clicando no botão Entrar...");
    await page.click(".jss46");

    console.log("Inserindo Login SESC...");
    await page.type("#cpf", process.env.LOGIN),
      await page.type("#cpf-password", process.env.PASSWORD, { delay: 100 }),
      await page.click(
        "#simple-tabpanel-0 > div > button > span.MuiButton-label > span",
        { delay: 100 }
      );

    //"Selecionando botão de agendamento..."
    await page.waitForSelector(
      "div:nth-child(2) > .MuiGrid-root > .MuiGrid-root > .MuiGrid-root > .MuiButtonBase-root .plenaStyle-outlined",
      { timeout: 100000 }
    );

    // const jobExecuted = await handleCron();
    console.log("Selecionando botão de agendamento...");
    await page.click(
      "div:nth-child(2) > .MuiGrid-root > .MuiGrid-root > .MuiGrid-root > .MuiButtonBase-root .plenaStyle-outlined"
    );

    console.log("Selecionando o botão Agendar...");
    await page.waitForSelector(".MuiButton-label > .plenaStyle-contained", {
      timeout: 100000,
    });
    await page.click(".MuiButton-label > .plenaStyle-contained", {
      delay: 100,
    });

    console.log("Clicando em continuar caso tenha dependentes...");
    await page.waitForSelector(".plenaStyle-contained:nth-child(1)", {
      timeout: 100000,
    });
    await page.click(".plenaStyle-contained:nth-child(1)");


    var job = new CronJob(
    
      "* * 14 * * *",
      function () {
        schedule(page, browser);
        job.stop();
      },
      null,
      false,
      "America/Sao_Paulo"
    );

    job.start();
      
    } catch (error) {
      console.log("Error ===> ",error)
      await page.screenshot({ path: "agendamento.png"});
    }
 
    
  })();
};

async function schedule(page, browser) {
  console.log("Selecionando a unidade...");
  await page.waitForSelector("#unidades");
  await page.click("#unidades", { delay: 2000 });

  const NUMBER_ELEMENT_SESC_CARMO_IN_HTML = "4";

  await page.waitForSelector(
    `#menu- > div.MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded > ul > li:nth-child(${NUMBER_ELEMENT_SESC_CARMO_IN_HTML})`
  );
  await page.click(
    `#menu- > div.MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded > ul > li:nth-child(${NUMBER_ELEMENT_SESC_CARMO_IN_HTML})`,
    { delay: 1000 }
  );

  //Tratar fila
  //body > div:nth-child(12) > div.MuiDialog-container.MuiDialog-scrollPaper > div > div.MuiDialogContent-root caso tenha fila

  console.log("Selecionando o horario...");
  const THE_HOURS_SELECTOR =
    "#root > div > div.jss146 > div:nth-child(3) > div:nth-child(2) > div:nth-child(8)"; //13:30
  // const THE_HOURS_SELECTOR =
  //   "#root > div > div > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > p"; //12:00


  await page.waitForTimeout(5000);
  await page.click(THE_HOURS_SELECTOR, {delay: 5000});

  console.log("Confirmando horario...");
  await page.waitForSelector(".plenaStyle-contained:nth-child(1)", {
    timeout: 100000,
  });
  await page.click(".plenaStyle-contained:nth-child(1)");

  console.log("Screenshotting do agendamento...");
  await page.waitForNavigation(), // The promise resolves after navigation has finished
    await page.waitForSelector(
      "#root > div > div > div > div.MuiGrid-root.jss292.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-9.MuiGrid-grid-lg-9 > div > div > div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column.MuiGrid-grid-xs-10 > div > div"
    );

    try {
      await page.screenshot({ path: "agendamento.png" , delay: 1000});
    } catch (error) {
      console.log(error)
      await page.screenshot({ path: "agendamento.png"});
    }


  
  await browser.close();
}

agendaSesc();
