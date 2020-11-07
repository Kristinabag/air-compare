require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();
const { GOOGLEKEY } = process.env;

router
  .get('/', (req, res, next) => {
    res.render('index', { GOOGLEKEY });
  })
  .get('/:latit/:longit', async (req, res, next) => {
    const { latit, longit } = req.params;
    try {
      const data = await fetch(
        `https://api.airvisual.com/v2/nearest_city?lat=${latit}&lon=${longit}&key=${process.env.APIKEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const nearestLeftTop = await fetch(
        `https://api.airvisual.com/v2/nearest_city?lat=${latit + 0.7}&lon=${
          longit - 0.7
        }&key=${process.env.APIKEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const nearestRightTop = await fetch(
        `https://api.airvisual.com/v2/nearest_city?lat=${latit + 0.7}&lon=${
          longit + 0.7
        }&key=${process.env.APIKEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const nearestRightBottom = await fetch(
        `https://api.airvisual.com/v2/nearest_city?lat=${latit - 0.7}&lon=${
          longit + 0.7
        }&key=${process.env.APIKEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const nearestLeftBottom = await fetch(
        `https://api.airvisual.com/v2/nearest_city?lat=${latit - 0.7}&lon=${
          longit - 0.7
        }&key=${process.env.APIKEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const jsonData = await data.json();
      const jsonDataLeftTop = await nearestLeftTop.json();
      const jsonDataRightTop = await nearestRightTop.json();
      const jsonDataRightBottom = await nearestRightBottom.json();
      const jsonDataLeftBottom = await nearestLeftBottom.json();

      // eslint-disable-next-line max-len
      if (!jsonData || !jsonDataLeftTop || !jsonDataRightTop || !jsonDataRightBottom || !jsonDataLeftBottom) {
        return res.json([]);
      }
      return res.json([
        jsonData,
        jsonDataLeftTop,
        jsonDataRightTop,
        jsonDataRightBottom,
        jsonDataLeftBottom,
      ]);
    } catch (err) {
      console.log(err);
    }
  });

module.exports = router;
