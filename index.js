const express = require('express');
const exphbs  = require('express-handlebars');
const pg = require('pg');
const Pool = pg.Pool;

const app = express();
const PORT =  process.env.PORT || 3017;

const ElectricityMeters = require('./electricity-meters');

// const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/topups';

const connectionString = process.env.DATABASE_URL || 'postgresql://decproc:1234@localhost:5432/topups';

let pool 
if (process.env.DATABASE_URL){
	pool = new Pool({
		connectionString,
		ssl: {rejectUnauthorized:false}
	})
}else{
	pool = new Pool({connectionString,ssl:false})
}

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const electricityMeters = ElectricityMeters(pool);

app.get('/', function(req, res) {
	res.redirect('/streets');
});

app.get('/streets', async function(req, res) {
	const streets = await electricityMeters.streets();
	console.log(streets);
	res.render('streets', {
		streets
	});
});

app.get('/meters/:street_id', async function(req, res) {

	// use the streetMeters method in the factory function...
	// send the street id in as sent in by the URL parameter street_id - req.params.street_id
	// create  template called street_meters.handlebars
	// in there loop over all the meters and show them on the screen.
	// show the street number and name and the meter balance
	var id = req.params.street_id;
	var data = await electricityMeters.streetMeters(id)
	
	res.render('street_meters', {
		meters: data
		
	});
});

app.get('/appliance', async function(req, res) {
	var appliance = await electricityMeters.appliances()
	res.render('appliance', {
		appliance: appliance
	})
})

app.get('/meter/use/:meter_id', async function(req, res) {
	var meterId = req.params.meter_id;
	var appliance = await electricityMeters.appliances(meterId)
	console.log(appliance)

	// show the current meter balance and select the appliance you are using electricity for
	res.render('use_electicity', {
		meters : appliance,
		meterId : meterId
	});
});

app.post('/usemeter', async function(req, res) {
	console.log(req.body)
	// update the meter balance with the usage of the appliance selected.
	// [Object: null prototype] { appliance: '3', meterId: '1' }
	var appliance = req.body.appliance;
	var meterId = req.body.meterId

	await electricityMeters.useElectricity(meterId, "no units",appliance)
	res.redirect(`/streets`);

});

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`App started on port ${PORT}`)
});