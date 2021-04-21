const fs = require('fs');

const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerBD();
    }

    get historialCapitalizado() {
        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p.charAt(0).toUpperCase() + p.slice(1) );
            
            return palabras.join(' ');

        });
    }

    get paramsMapBox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeatherMap() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async ciudad( lugar = '' ) {

        try {

            // Petición HTTP
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapBox
            });

            const resp = await intance.get();

            // ({}) retornar un objeto de forma implicita
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
            
        } catch (error) {
            return [];
        }

    }

    async climaLugar( lat, lon ) {

        try {
            
            // Peticion HTTP
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeatherMap, lat, lon }
            });

            const resp = await instance.get();

            const { weather: [{ description }], main: { temp_min, temp_max, temp } } = resp.data;

            return {
                desc: description,
                min: temp_min,
                max: temp_max,
                temp: temp
            }

        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial( lugar = '' ) {
        
        if ( this.historial.includes( lugar.toLocaleLowerCase() ) ) {
            return;
        }
        
        this.historial = this.historial.splice(0, 5);

        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar FileSystem
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historial: this.historial
        };
        
        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
    }

    leerBD() {

        if ( !fs.existsSync(this.dbPath) ) {
            return null;
        }

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
        const data = JSON.parse( info );

        this.historial = data.historial;
        
    }

}

module.exports = Busquedas;