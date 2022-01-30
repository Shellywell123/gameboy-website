import boto3
import os
import logging
import uuid
from webdriver_screenshot import WebDriverScreenshot
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')

def lambda_handler(event, context):
    logger.info('## ENVIRONMENT VARIABLES')
    logger.info(os.environ)

    urls = os.environ['URLS'].split('|')

    for url in urls:
        screenshot_file = "{}-{}".format(''.join(filter(str.isalpha, url)), datetime.today().strftime('%Y%m'))
        driver = WebDriverScreenshot()

        logger.info('Generate fixed height screenshot')
        driver.save_screenshot(url, '/tmp/{}-fixed.png'.format(screenshot_file), height=1280)

        logger.info('Generate full height screenshot')
        driver.save_screenshot(url, '/tmp/{}-full.png'.format(screenshot_file))

        driver.close()

        if all (k in os.environ for k in ('BUCKET','DESTPATH')):
            ## Upload generated screenshot files to S3 bucket.
            s3.upload_file('/tmp/{}-fixed.png'.format(screenshot_file),
                        os.environ['BUCKET'],
                        '{}/{}-fixed.png'.format(os.environ['DESTPATH'], screenshot_file))
            s3.upload_file('/tmp/{}-full.png'.format(screenshot_file),
                        os.environ['BUCKET'],
                        '{}/{}-full.png'.format(os.environ['DESTPATH'], screenshot_file))
