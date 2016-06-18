
var proj4 = require('proj4');
// Transform points from grid coordinates to latitude longitude
// tileBounds input is [[upperLeft], [lowerRight]] in latitude/longitude
// point input is [x,y] position assumes grid starts at 0,0 in the NW 


function transformPoint(tileBounds, gridWidth, point) {
  var latMax = tileBounds[0][0]
  var longMax = tileBounds[0][1]
  var latMin = tileBounds[1][0]
  var longMin = tileBounds[1][1]

  var pixelHeight = (latMax - latMin) /gridWidth
  var pixelWidth = (longMax - longMin) /gridWidth

  // Find the coordinates of all four corners of the cell and average them to find the center
  function findLat(coord) { 
     var north = latMax - (coord[0] * pixelHeight) 
     var south = latMax- ((coord[0]+1) * pixelHeight)
     return (north + south) /2
  }

  function findLong(coord) {
    var west = longMax - (coord[1] * pixelWidth) 
    var east = longMax - ((coord[1]+1) * pixelWidth)
    return (west + east) /2
  }

  return[findLat(point), findLong(point)]

}

// console.log(transformPoint([[37.94717, -121.9632223],[37.7818184, -121.6267218]], 3, [1,1]))
// var testHeightMap =[[1,1,1,1,1,1,1],[2,2,2,2,2,2,2],[3,3,3,3,3,3,3]]
// var testCoords = [[1,1],[2,2],[3,3]]

function lookupZ(coord, heightMap) {
  return heightMap[coord[0]][coord[1]]
}



// Returns an array of coordinates in UTM 
function createCoordinates(coords, imageBounds, gridHeight, heightMap) {
  var outputCoords = []
  for (i = 0; i < coords.length; i++) {
    var coordinates = transformPoint(imageBounds, gridHeight, coords[i])
    coordinates.push(lookupZ(coords[i],heightMap))
    outputCoords.push(coordinates)
  }
  return outputCoords
}

// Convert coordinates to Lat/Long 
function transformProjection(coords) {
  var transformedCoords = [];
  for(var i =0; i < coords.length; i++) {
    transformedCoords.push(proj4('WGS84', 'EPSG::32610', coords[i]));
  }
  return transformedCoords;
}

// createCoordinates(testCoords, [[37.94717, -121.9632223],[37.7818184, -121.6267218]], 7, testHeightMap)


// Preapre the data to be passed to our backend IP
function formatData(coords){
  var newFeature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coords
    },
    properties: {
    }
  };
  return newFeature
};
