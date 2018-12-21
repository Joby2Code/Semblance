import boto3

sqs_client = boto3.client('sqs')
queue_url = 'https://sqs.us-west-2.amazonaws.com/661219094067/identified-face-queue'
sqs = boto3.resource('sqs')
queueName = 'identified-face-queue'


queue = sqs.get_queue_by_name(QueueName=queueName)


def read_messages_from_queue():
    name_set = set()
    print('reading from queue url', queue.url)
    
    for message in queue.receive_messages(MessageAttributeNames=['Face']):
        print('read')
        if message.message_attributes is not None:
            name = message.message_attributes.get('Face').get('StringValue')
            print('from queue',name)
            if name not in name_set:
                name_set.add(name)
        
        message.delete()
    return name_set


def process_messages_from_queue():
    print('processing from sqs...')
    #name_set = set()
    messages = []
    name_set = set()
    while True:
        resp = sqs_client.receive_message(
            QueueUrl=queue_url,
            AttributeNames=['All'],
            MessageAttributeNames=['All'],
            MaxNumberOfMessages=10
        )

        try:
            messages.extend(resp['Messages'])
        except KeyError:
            break
        
        
        for message in messages:
            name = message['MessageAttributes']['Face']['StringValue']
            #name = name.replace('_', " ")
            if name not in name_set:
                name_set.add(name)
        
        entries = [
            {'Id': msg['MessageId'], 'ReceiptHandle': msg['ReceiptHandle']}
            for msg in resp['Messages']
        ]

        resp = sqs_client.delete_message_batch(
            QueueUrl=queue_url, Entries=entries
        )
        
        if len(resp['Successful']) != len(entries):
            raise RuntimeError(
                f"Failed to delete messages: entries={entries!r} resp={resp!r}"
            )
            
        print('{} messages deleted'.format(len(messages)))
    
    print('reading final queues',name_set)
    return name_set