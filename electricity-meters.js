// this is our
module.exports = function(pool) {

	// list all the streets the we have on records
	async function streets() {
		const streets = await pool.query(`select * from street`);
		return streets.rows;
	}

	// for a given street show all the meters and their balances
	async function streetMeters(streetId) {
		if(streetId !== "style.css"){
			const street = await pool.query(`select balance,street_number,street.name,electricity_meter.id from electricity_meter
			 INNER JOIN street on electricity_meter.street_id = street.id where street_id = $1`, [streetId]);
			return street.rows;
		}

// 	  SELECT Orders.OrderID, Customers.CustomerName, Orders.OrderDate
//     FROM Orders
//     INNER JOIN Customers ON Orders.CustomerID=Customers.CustomerID;


	}

	// return all the appliances
	async function appliances() {
		var storeData = await pool.query(`select * from appliance`);
		return storeData.rows;

	}

	// increase the meter balance for the meterId supplied
	async function topupElectricity(meterId, units) {
		await pool.query(`update electricity_meter set balance = balance + $1 where id = $2`, [units, meterId]);
	}
	
	// return the data for a given balance
	async function meterData(meterId) {
		var meter = await pool.query(`select balance from electricity_meter where id =$1`, [meterId]);
		return meter.rows[0];
		
	
	}

	// decrease the meter balance for the meterId supplied
	async function useElectricity(meterId, units, applianceId) {
		if(units == "no units"){
			var app = await pool.query(`select rate from appliance where id =$1`, [applianceId]);
			var appCost = app.rows[0].rate
			await pool.query(`update electricity_meter set balance = balance - $1 where id = $2`, [appCost, meterId]);
		}else{
			await pool.query(`update electricity_meter set balance = balance - $1 where id = $2`, [units, meterId]);
		}
	
	}

	return {
		streets,
		streetMeters,
		appliances,
		topupElectricity,
		meterData,
		useElectricity
	}

}