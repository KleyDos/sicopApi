import puppeteer from "puppeteer";
import mongoose from "mongoose";
import express from "express";
import modelConcursos from "./model/concursos.js";

const server = express();

const uri =
  "mongodb+srv://KleyDos:MONGOdb@cluster0.epuveci.mongodb.net/SicopApi";
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.timeEnd("test");
    server.listen(3001, function () {
      console.log("El Servidor esta corriendo en puerto 3001");
    });
    //server.listen(puerto, funcion)
  })
  .catch((err) => console.log(err));

async function openWebPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 400,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.sicop.go.cr/"
    //   {
    //   waitUntil: "networkidle2",
    // }
  );

  const frames = await page.frames();

  const topFrame = frames.find((f) => f.name() === "topFrame");

  if (topFrame) {
    console.log("Successfully found topFrame!");
    // const frameContent = await topFrame.content();
    // console.log(frameContent);

    await topFrame.waitForSelector('li[title="Consulta Ciudadanos"] a', {
      timeout: 5000,
    });

    await topFrame.click('li[title="Consulta Ciudadanos"] a', {
      timeout: 5000,
    });

    console.log('Clicked on "Consulta Ciudadanos"');
    const frames = await page.frames();
    // await page.waitForTimeout(2000);

    const leftFrame = frames.find((f) => f.name() === "leftFrame");
    // console.log("leftFrame es:", leftFrame);
    if (!leftFrame) {
      console.log("leftFrame not found!");
    }

    console.log("Successfully found leftFrame!");

    // const frameContent = await leftFrame.content();
    // console.log(frameContent);

    await leftFrame.waitForSelector(
      'li[title="Historial de participación"] a',
      {
        timeout: 5000,
      }
    );

    await leftFrame.click('li[title="Historial de participación"] a');

    console.log('Clicked on "Historial de participación"');
    // const frmFrames = await page.frames();
    const rightFrame = frames.find((f) => f.name() === "rightFrame");

    if (!rightFrame) {
      console.log("rightFrame not found!");
    }

    console.log("Successfully found rightFrame!");
    // const frameContent = await rightFrame.content();
    // console.log(frameContent);

    await rightFrame.waitForSelector('input[name="biz_reg_no"]');
    await rightFrame.type('input[name="biz_reg_no"]', "3101125558");
    await rightFrame.click('a[title="Consultar"]');
    console.log("Successfully searched!");
    // await rightFrame.waitForNavigation({ waitUntil: "networkidle0" });

    const tableFrame = frames.find((f) => f.name() === "rightFrame");

    if (!tableFrame) {
      console.log("tableFrame not found!");
    }
    console.log("Successfully found tableFrame!");

    const tableContent = await tableFrame.content();
    console.log(tableContent);

    const tableData = await rightFrame.evaluate(() => {
      console.log("en proceso...");
      const rows = document.querySelectorAll("table.eptable tr");
      const data = [];
      rows.forEach((row, index) => {
        console.log(index, "index");
        const cells = row.querySelectorAll("td");
        console.log(cells, "cells");
        const rowData = Array.from(cells).map((cell) =>
          cell.textContent.trim()
        );

        //data.push(rowData);

        if (index > 0) {
          data.push(
            {
              procedimiento: rowData[0] ? rowData[0].split("\n\t\t")[0] : null,
              institucion: rowData[0] ? rowData[0].split("\n\t\t")[1] : null,
              partida: rowData[1] || null,
              descripcion: rowData[2] || null,
              fecha: rowData[3] || null,
              monto: rowData[5] || null,
            }
            // rowData.reduce((acc, val, i) => {
            //   console.log("val :>>", val);
            //   console.log("i :>>", i);
            //   console.log("acc :>>", acc);

            //   if (i === 0) {
            //     acc.procediento = val.split("\n\t\t")[0];
            //     acc.institucion = val.split("\n\t\t")[1];
            //   }
            //   if (i === 1) {
            //     acc.partida = val;
            //   }
            //   return acc;
            // }, {})
          );
        }
        console.log(rowData, "rowData");
      });
      return data;
    });
    console.log(tableData);

    // tableData.forEach(async (item) => {
    //   const nuevoConcurso = new modelConcursos(item);
    //   try {
    //     await nuevoConcurso.save();
    //     console.log("Datos guardados en MOngoDB:", item);
    //   } catch (error) {
    //     console.log("Error al guardar los datos:", error);
    //   }
    // });

    try {
      const savePromises = tableData.map(async (item) => {
        const nuevoConcurso = new modelConcursos(item);
        return await nuevoConcurso.save();
      });
      await Promise.all(savePromises);
      console.log("Datos guardados en MOngoDB:", item);
    } catch (error) {
      console.log("Erorr al guardar los datos", error);
    }

    await tableContent.waitForSelector("table.eptable");
    console.log("continue...");
  } else {
    console.log("topFrame not found!");
  }

  // await browser.close();
  // process.exit(0);
}

openWebPage();

// (async () => {
//   const browser = await puppeteer.launch({ headless: false, slowMo: 400 });
//   const page = await browser.newPage();
//   await page.goto("https://www.sicop.go.cr");
//   await page.click('a[li title="Consulta Ciudadanos"]');
//   await page.screenshot({ path: "inicial.png" });
//   const pageTitle = await page.title();
//   console.log("Titulo de la página:", pageTitle);

// // const data = await page.evaluate(( => {
// //   let title = document.querySelector(" ").innerText;
// //   let description = document.querySelector(" ").innerText;
// //   return{
// //     title,
// //     description
// //   }
// // }))

//   await browser.close();
// })();
