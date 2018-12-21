import json
import boto3
import data_index
import queue_service as qs
import notification_service as ns


def lambda_handler(event, context):
    
    email_id = event["email_id"]
    names = qs.process_messages_from_queue()
    names = list(names)
    print('from queue....',names)
    '''
    email_id = 'test'
    names = ['Joby_Joy']
    temp = {
        'pm2696':'Pranav_Reddy'
    }
    es.index(index="students", doc_type="_doc", id="500", body=temp)
    print(es.get(index="students", doc_type="_doc", id="500"))
    '''
    es = data_index.connect_to_elastic_search()
    records = data_index.search_student_records(es, names)
    print('from elastic search..',records)
    
    ns.publish_report(records,email_id)
    
    result = "Email sent successfully to {}. Please check your inbox.".format(email_id)
    return {
        'statusCode': str(200),
        'results': result,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            },
        }