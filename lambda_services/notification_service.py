import boto3
from botocore.exceptions import ClientError


sns_client = boto3.client('sns')
SNSTopic = 'arn:aws:sns:us-west-2:661219094067:SemblanceFacialRecognitionStack-SNSTopic-3UZW4H9M62FY'

#Helper Functions.........


# Get The Current Date Or Time
def getdatetime(timedateformat='complete'):
    from datetime import datetime
    timedateformat = timedateformat.lower()
    if timedateformat == 'day':
        return ((str(datetime.now())).split(' ')[0]).split('-')[2]
    elif timedateformat == 'month':
        return ((str(datetime.now())).split(' ')[0]).split('-')[1]
    elif timedateformat == 'year':
        return ((str(datetime.now())).split(' ')[0]).split('-')[0]
    elif timedateformat == 'hour':
        return (((str(datetime.now())).split(' ')[1]).split('.')[0]).split(':')[0]
    elif timedateformat == 'minute':
        return (((str(datetime.now())).split(' ')[1]).split('.')[0]).split(':')[1]
    elif timedateformat == 'second':
        return (((str(datetime.now())).split(' ')[1]).split('.')[0]).split(':')[2]
    elif timedateformat == 'millisecond':
        return (str(datetime.now())).split('.')[1]
    elif timedateformat == 'yearmonthday':
        return (str(datetime.now())).split(' ')[0]
    elif timedateformat == 'daymonthyear':
        return ((str(datetime.now())).split(' ')[0]).split('-')[2] + '-' + ((str(datetime.now())).split(' ')[0]).split('-')[1] + '-' + ((str(datetime.now())).split(' ')[0]).split('-')[0]
    elif timedateformat == 'hourminutesecond':
        return ((str(datetime.now())).split(' ')[1]).split('.')[0]
    elif timedateformat == 'secondminutehour':
        return (((str(datetime.now())).split(' ')[1]).split('.')[0]).split(':')[2] + ':' + (((str(datetime.now())).split(' ')[1]).split('.')[0]).split(':')[1] + ':' + (((str(datetime.now())).split(' ')[1]).split('.')[0]).split(':')[0]
    elif timedateformat == 'complete':
        return str(datetime.now())
    elif timedateformat == 'datetime':
        return (str(datetime.now())).split('.')[0]
    elif timedateformat == 'timedate':
        return ((str(datetime.now())).split('.')[0]).split(' ')[1] + ' ' + ((str(datetime.now())).split('.')[0]).split(' ')[0]




#Create the text for the email report
def create_email_report(attendee_record):
    
    msg = """<!DOCTYPE html>
    <html>
        <head>
            <h2> Cloud Computing - CS-GY 9223 C </h2>
            
            <style>
                #students {
                font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
                border-collapse: collapse;
                width: 100%;
                }

                #students td, #students th {
                border: 1px solid #ddd;
                padding: 8px;
                }

                #students tr:nth-child(even){background-color: #f2f2f2;}

                #students tr:hover {background-color: #ddd;}

                #students th {
                padding-top: 12px;
                padding-bottom: 12px;
                text-align: left;
                background-color: #694caf;
                color: white;
                }
            </style>


        </head>
        <body>
            <table id="students">
                <tr>
                    <th>NetID</th>
                    <th>Name </th>
                </tr>"""
            
            
    for netid, name in attendee_record.items():
        print(netid, name)
        name = name.replace('_', " ")
        msg= msg+"""  
                <tr><td>{0}</td>
                    <td>{1}</td></tr>\n""" .format(netid,name)
    
    msg = msg+"""
            </table>
        </body>
    </html>"""
    
    return msg
    

def send_email_with_ses(msg,email_id):

    SENDER = "topjoy89@gmail.com"
    RECIPIENT = email_id

   
    AWS_REGION = "us-west-2"
    
    date = getdatetime(timedateformat='daymonthyear')
    
    SUBJECT = "Attendance Report for {}".format(date);

    BODY_TEXT = ("Attendance report generated (Python)\r\n"
                 "via Facial Recognition. "
                 )

    
    BODY_HTML = msg

    # The character encoding for the email.
    CHARSET = "UTF-8"

    # Create a new SES resource and specify a region.
    client = boto3.client('ses', region_name=AWS_REGION)

    # Try to send the email.
    try:
        # Provide the contents of the email.
        response = client.send_email(
            Destination={
                'ToAddresses': [
                    RECIPIENT,
                ],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': BODY_HTML,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': BODY_TEXT,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT,
                },
            },
            Source=SENDER
        )
        
    # Display an error if something goes wrong.
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])
    


def create_subscription(email):
    response = sns_client.subscribe(
        TopicArn=SNSTopic,
        Protocol='email',
        Endpoint=email,
        ReturnSubscriptionArn=True | False
    )
    return response['ResponseMetadata']['HTTPStatusCode']


def publish_report(attendee_list,email_id):
    
    msg = 'No matched faces found'
    if len(attendee_list) > 0 :
        msg =  create_email_report(attendee_list)
        print(msg)
        send_email_with_ses(msg,email_id)
    



