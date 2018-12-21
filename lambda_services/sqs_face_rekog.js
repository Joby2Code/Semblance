var AWS = require('aws-sdk');

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var sqs_queue = process.env.sqs_queue;

var matchedFaceList = [];
var matchFaceMap = {};
/*
Helpers
*/
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}


function add_to_queue(matchedFaceName) {
    console.log("adding to queue",matchedFaceName);
    var params = {
          MessageAttributes: {
              "Face":{
                DataType: "String",
                StringValue: matchedFaceName
              }
          },
          MessageBody: "Faces recognized from AWS Rekognition.",
          QueueUrl: sqs_queue
      };

    sqs.sendMessage(params, function(err, data) {
          if (err) {
                console.log("Error writing to sqs", err);
          } else {
            console.log("Success", data.MessageId);
            console.log(data);
          }
    });

}

exports.handler = (event, context, callback) => {
        
        console.log('reading from kinesis.....');
        var matchedFace = 0;
        var matchedFaceName = '';
        var boundingBox = '';
        event.Records.forEach((record) => {
            
            // Kinesis data is base64 encoded so decode here
            const load = new Buffer(record.kinesis.data, 'base64').toString('ascii');
            const payload = JSON.parse(load);
       
           if(payload.FaceSearchResponse != null)
           {
               payload.FaceSearchResponse.forEach((face) =>  {
                   
                   if(face.MatchedFaces != null && 
                         Object.keys(face.MatchedFaces).length > 0)
                   {    
                       for(var i = 0 ; i < face.MatchedFaces.length; i++ ) {
                            console.log(face.MatchedFaces[i]);
                            matchedFaceName = face.MatchedFaces[i].Face.ExternalImageId;
                            if(!isInArray(matchedFaceName,matchedFaceList)){
                                matchedFaceList.push(matchedFaceName);
                                matchFaceMap[matchedFaceName] = face.MatchedFaces[i].Face.BoundingBox;
                                console.log('Name......'+matchedFaceName);
                                //console.log('Bondingbox..'+boundingBox);
                            }
                            
                       }
                    matchedFace++; 
                      
                   }
               });
           }
        });
        
        if(matchedFace > 0)
        {   
            console.log('Writing to '+sqs_queue);
            console.log(matchedFaceList);
            console.log(matchFaceMap);
            for (var name in matchedFaceList) {
                matchedFaceName = matchedFaceList[name];
                //matchedFaceName = name;
                add_to_queue(matchedFaceName)
            }
            
        }


};