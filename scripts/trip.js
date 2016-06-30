/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /**
 * Wraps an actual trip taken by a vehicule
 * @class Trip
 * @constructor Trip
 * @param {Object} [dto]
 * @param {Object} [dto.client]: an instance of client.Client
 * @param {Object} [dto.data]: trip initialization data. Property "id" is mandatory in data 
 */
function Trip(dto) {
  
  if (!dto || !dto.data) {
    
     throw {
       
      errorCode: "Invalid_Parameter",
      errorDetail: "Trip - dto.client and dto.data.id cannot be null or empty"
    };
  }
  
  this.client = dto.client;
  for (var prop in dto.data) {
    this[prop] = dto.data[prop];
  }
}

/**
 * Return all locations that were "visited" during the trip
 * @method listLocations
 */
Trip.prototype.listLocations = function() {
  
  var query = {
    
    url : config.apiUrl + "/" +  config.apiVer + "/trips/" + this.id + "/locations",
    method : "GET"
  };
  
  return this.client.callApi(query);
};

/**
 * Return all signals that were emitted during the trip
 * @method listSignals
 */
Trip.prototype.listSignals = function() {
  
  var query = {
    
    url : config.apiUrl + "/" +  config.apiVer + "/trips/" + this.id + "/signals",
    method : "GET"
  };
  
  return this.client.callApi(query);
};			