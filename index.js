require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/Busquedas');


const main = async() => {

    const busquedas = new Busquedas();
    let opt;

    do {
        
        opt = await inquirerMenu();
        
        switch (opt) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput('Ingrese una ciudad: ');
                
                // Buscar los lugares
                const lugares = await busquedas.ciudad( termino );
                
                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if ( id === 0 ) continue;
                const lugarSel = lugares.find( lugar => lugar.id === id );

                // Guardar en DB
                busquedas.agregarHistorial( lugarSel.nombre );

                // Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng );

                // Mostrar resultados
                console.clear();
                console.log('\nInformación de la ciudad\n'.magenta);
                console.log('Ciudad:', lugarSel.nombre.cyan );
                console.log('Lat:', lugarSel.lat );
                console.log('Lng:', lugarSel.lng );
                console.log('Temperatura:', clima.temp );
                console.log('Mínima:', clima.min );
                console.log('Máxima:', clima.max );
                console.log('Condiciones:', clima.desc.cyan );
                break;

            case 2:
                busquedas.historialCapitalizado.forEach( ( lugar, indice ) => {
                    const idx = `${ indice + 1 }. `.magenta;
                    console.log(`${ idx }${ lugar }`);
                });
                break;
        }

        if( opt !== 0 ) await pausa();

    } while ( opt !== 0 );

}

main();