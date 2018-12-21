var AWS = require('aws-sdk');
var sns = new AWS.SNS();

var SNSTopic = process.env.sns;

exports.handler = (event, context, callback) => {
   // console.log('Received event:', JSON.stringify(event, null, 2));
    
        //console.log('Received event:', JSON.stringify(event, null, 2));
        var matchedFace = 0;
        var unmatchedFace = 0;
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
                       matchedFace++;
                   }
                   else
                   {
                       unmatchedFace++;
                   }
               });
           }
        });
        
        if(matchedFace > 0 || unmatchedFace > 0)
        {
            var params = {
              Message: matchedFace + ' Known Person(s) found ' + unmatchedFace + ' Unknown Person(s) on Video Feed', /* required */
              TopicArn: SNSTopic
            };
            sns.publish(params, function(err, data) {
              if (err){
                console.log(err, err.stack); // an error occurred
                callback(err);
              } 
              else{
                console.log(data);           // successful response
                callback(null, `Successfully processed ${event.Records.length} records.`);
              }     
            });
        }
};