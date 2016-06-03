# xee connector
## About xee
[xee](http://www.xee.com) is a company that designs and sells a device that turns any vehicle built after 1996 into a connected vehicle. 
Thanks to this device, end users have access to a multitude of data generated by their vehicles.
Moreover, the device's data and services are exposed to developers as REST APIs, which opens up tremendous opportunities.
## Purpose of the scriptr.io connector for xee
The purpose of this connector is to simplify and streamline the way you access xee's APIs from scriptr.io, by providing you with a few native objects that you can directly integrate into your own scripts. 
This will hopefully allow you to create sophisticated applications. For example, using the information about the distance ran by a car and its fuel consumption, you can implement a "pay as you go" car rental
application.
## Components
- xee/user: this is the main object to interact with. It provides access to data of a given user (the one for who you are passing an access token)
- xee/vehicle: you usually obtain an instance of this component from the former. It allows you to obtain all the actions that you can do on a user's vehicle, usually to retrieve data or to subscribe to notifications,
- xee/notificationHandler: regularly check for events that occurred on the vehicles and match them to subscriptions. When a match is found, a notification is sent through a websocket channel and/or by email,
- xee/notificationsManager: provide functionality to subscribe to vehicle events and manage those subscriptions,
- xee/util: module with utilily functions used internally,
- xee/config: use this configuration file to specify how often to check for events and how to send notifications (web sockets, email),
- xee/client: generic http client that handles the communication between scriptr.io and xee,
- xee/oauth2: this folder contains the script that handle the OAUTH2 workflow to obtain end user authentication tokens
- xee/test/tests: a list of all the objects and corresponding methods, for examples on how to use them.

## How to use
- Deploy the aforementioned scripts in your scriptr account, in a folder named "xee",
- Create a developer account and an application at [xee](https://developer.xee.com/),
- Once done, make sure to copy/paste the values of your application Key and application secret in the corresponding
variables of the "xee/oauth2/config file" (respectively client_id and client_secret). Also replace"YOUR_AUTH_TOKEN" with your actual scriptr.io auth token in the "redirect_uri" variable,
- Create an end user (driver) account (https://www.xee.com/customer/account/login/)  
- Create a test script in scriptr, or use the script provided in xee/test/. 

### Obtain end users access tokens from xee

#### Step 1
From a front-end application, send a request to the ```/oauth2/getRequestCodeUrl``` script, passing the ```username``` parameter. 
The username can be the actual end user's xee username or another username he decides to use in your IoT application. 
The result returned by the aforementioned script should resemble the following:

```
>> curl -X POST  -F username=edison -F apsws.time=1434722158021 -H 'Authorization: bearer <YOUR_AUTH_TOKEN>' 'https://api.scriptrapps.io/xee/oauth2/getRequestCodeUrl'
{
	"metadata": {
		"requestId": "45753a7f-a2b6-4378-a8e1-3bbddced9694",
		"status": "success",
		"statusCode": "200"
	},
	"result": "https://cloud.xee.com/v1/auth/auth?client_id=A8F05UiopFAznZPMHjxZ&scope=user_get%20email_get%20car_get%20data_get%20location_get%20address_all%20accelerometer_get&state=42e8e1&redirect_uri=https%3A%2F%2Fapi.scriptr.io%2Fxee%2Foauth2%2FgetAccessToken%3Fauth_token%3CRkY19EJKL0UcNw%3D%3D""
}
```
#### Step 2

From the front-end, issue a request to the URL obtained at step 1. This redirects your end user to the Xee login page, 
where he has to enter his credentials then authorize the application on the requested scope. 
Once this is done, xee automatically calls back the ```xee/getAccessToken``` script, providing it with an access and a refresh token that it stores in your scriptr.io's global storage. The tokens are also returned by the script.

### Use the connector

In order to use the connector, you need to import the main module: ```xee/user```, as described below:
```
var userModule = require("/modules/xee/user");
```
Then create a new instance of the User class, defined in this module (we assume that we already otbained an access token for the given user):
```
var user = new userModule.User({username:"edison"});
```
The User class provides many methods to obtain data related to the end user, such as:
```
var accountDetails = user.getAccount("some_account_id"); // details of a specific xee user account
var vehicles = user.listVehicles(); // lists the vehicles added by this user to his xee accounts
```
In order to manipulate the end user's vehicles, you first need to obtain a reference to an instance of the Vehicle class. You can do this by invoking the ```getVehicle(id)``` method of your ```User``` instance, as follows:
```
var vehicle = user.getVehicle({id:"some_id"}); // you can easily obtain the vehicles' ids using user.listVehicles()
```
You can also obtain an instance of vehicle by passing its plate number of the name that was given by the user to it
```
var vehicleByPlateNumber = user.getVehicle({plateNumber:"AAA"});
var vehicleByName = user.getVehicle({name:"S4"});
```

Using the vehicle object, you now retrieve data about the vehicle
```
var currentStatus = vehicle.getCurrentStatus();
var locations = vehicle.getLocationRecords();
var locationsDesc = vehicle.getLocationRecords("desc"); // same as above
var locationAsc = vehicle.getLocationRecords("asc");
var lastKnowLocation = vehicle.getLastKnowLocation();
var info = vehicle.getInfo(); // You can sort data "asc" or "desc" as follows vehicle.getInfo("asc");
var statusOverview = vehicle.getStatusOverview();
var wiperStatus = vehicle.getWiperStatus();
var wheelsStatus = vehicle.getWheelsStatus();
var pedalsStatus = vehicle.getPedalsStatus();
var lightsStatus = vehicle.getLightsAndIndicatorsStatus();
var WindowsStatus = vehicle.getWindowsStatus();
var doorsStatus = vehicle.getDoorsStatus();
var security = vehicle.getSecurityStatus();
var hoodTrunkCapStatus = vehicle.getHoodTrunkCapStatus();
var steeringStatus = vehicle.getSteeringStatus();
var speedStatus = vehicle.getSpeedStatus();
var fuelLevel = vehicle.getFuelLevel();
var batteryVoltage = vehicle.getBatteryVoltage();
var drivingData = vehicle.getDrivingData();
var acAndVentilation = vehicle.getACVentilationStatus();
```

You can also monitor events that might occur on the vehicle using vehicle.subscribeToNotification(). 
For example, assume you need to be notified whenever the engine speed reaches a given threashold:
```
// We monitor the EngineSpeed and need to be notified if it exceeds 5000
var engineSpeedAbove5000 = {
	username: vehicle.username,
    carId: vehicle.carId,
    event: "EngineSpeed",
    rule: ">=",
    value: 5000
};
  
vehicle.subscribeToNotification(engineSpeedAbove5000);

```

*You can check the list of all available methods using the ```xee/test/tests``` script.*

### About notifications
As mentioned, you can monitor the values of the components of a given vehicle and be notified whenever the values match the rules you specified. Use the xee/config file to specify how often should the values be checked and how you need to be notified of the occurrence of events

