const chosenPlaceDiv = document.getElementById('chosenPlace');
const geolocationButton = document.getElementById('geoLocation');
let latitude;
let longitude;

function initMap() {
  const myLatlng = { lat: 55.716, lng: 37.594 };
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: myLatlng,
  });

  async function getData(latit, longit) {
    try {
      const data = await fetch(`/${latit}/${longit}`);
      const jsonData = await data.json();
      if (jsonData.status === 'fail') return;
      return jsonData;
    } catch (err) {
      console.log(err);
    }
  }

  function setContent(dataArr, lat, lon) {
    // eslint-disable-next-line max-len
    const bestAQI = dataArr.sort((a, b) => a.data.current.pollution.aqius - b.data.current.pollution.aqius)[0];
    const bestAQICity = bestAQI.data.city;
    const [current, ...recommended] = dataArr;
    let explanation;
    if (current.data.current.pollution.aqius < 50) {
      explanation = 'Качество воздуха хорошее';
      chosenPlaceDiv.style.backgroundColor = 'lightgreen';
    } else if (current.data.current.pollution.aqius < 100) {
      explanation = 'Качество воздуха приемлемое. Однако, существует небольшая угроза здоровью для чувствительных к загрязнению воздуха людей.';
      chosenPlaceDiv.style.backgroundColor = 'darkkhaki';
    } else if (current.data.current.pollution.aqius < 150) {
      explanation = 'Воздух загрязнен. Люди, испытывающие проблемы со здоровьем, могут пострадать. Для остальных опасности, вероятно, нет.';
      chosenPlaceDiv.style.backgroundColor = 'orange';
    } else if (current.data.current.pollution.aqius < 200) {
      explanation = 'Воздух сильно загрязнен. Существует угроза здоровью всех людей, в особенности, страдающих хроническими заболеваниями.';
      chosenPlaceDiv.style.backgroundColor = 'orangered';
    } else if (current.data.current.pollution.aqius < 300) {
      explanation = 'Воздух чрезвычайно загрязнен! Все население подвергается опасности.';
      chosenPlaceDiv.style.backgroundColor = 'crimson';
    } else {
      explanation = 'В регионе чрезвычайное происшествие. Воздух экстремально опасен! Находиться на улице нельзя!';
      chosenPlaceDiv.style.backgroundColor = 'maroon';
    }

    chosenPlaceDiv.innerText = `Ваши координаты: ${lat.toString()
      .slice(0, 5)}, ${lon.toString()
      .slice(0, 5)}.
      Ближайший к вам город: ${current.data.city}.
      Уровень загрязнения здесь сегодня: ${current.data.current.pollution.aqius}.
      ${explanation}
      Информацию о качестве воздуха в соседних городах смотрите на карте
      ▼ ▼ ▼
      Рекомендуемое место для прогулки: ${bestAQICity}`;
    chosenPlaceDiv.style.display = 'block';
    recommended.forEach((item) => {
      const infoWindow = new google.maps.InfoWindow({
        position: {
          lat: item.data.location.coordinates[1],
          lng: item.data.location.coordinates[0],
        },
      });
      infoWindow.setContent(
        `${item.data.city}: AQI: ${item.data.current.pollution.aqius}`,
      );
      infoWindow.open(map);
    });
  }

  // Configure the click listener.
  map.addListener('click', (mapsMouseEvent) => {
    latitude = mapsMouseEvent.latLng.toJSON().lat;
    longitude = mapsMouseEvent.latLng.toJSON().lng;
    getData(latitude, longitude).then((dataArr) => setContent(dataArr, latitude, longitude));
  });

  geolocationButton.addEventListener('click', async () => {
    function success(pos) {
      const crd = pos.coords;
      latitude = crd.latitude;
      longitude = crd.longitude;
      getData(latitude, longitude).then((dataArr) => setContent(dataArr, latitude, longitude));
    }
    await navigator.geolocation.getCurrentPosition(success);
  });
}

initMap();
