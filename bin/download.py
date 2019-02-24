#!/usr/bin/env python3

import csv
import json
import os
import sys
import urllib.request
import urllib.error
from argparse import ArgumentParser

CEND: str = '\033[0m'
CYELLOW: str = '\33[33m'
CGREEN: str = '\33[32m'
CRED: str = '\033[91m'

SOURCE_DIR: str = "src"
DATA_DIR: str = "data"
DATA_FILENAME: str = "data.csv"
INFO_FILENAME: str = "info.json"
SOURCE_FILE: str = "data/source.json"
CSV_DELIMITER: str = ";"

MESSAGE_INFO: int = 0
MESSAGE_ERROR: int = -1
MESSAGE_SUCCESS: int = 1


def main():
    """
    Download source data and write it into output file
    """

    # Get source data
    source = get_source()

    # Get url information
    try:
        info = get_information(source['url'])

    except urllib.error.URLError:
        message("There is probably no active internet connection.", MESSAGE_ERROR)
        sys.exit(0)

    # Print data information
    message("Downloading: {} ...", MESSAGE_INFO, info['title'])

    # Write contents of downloaded file
    dl = download(info['data_url'], source['keys'], source['data_rows'])

    if dl:
        # Save information in file
        save_information(info, dl['file'], dl['keys'])

        # Print download result
        message("Download successful: {}", MESSAGE_SUCCESS, SOURCE_DIR + "/" + dl['file'])

    else:
        # Download not successful
        message("Download failed.", MESSAGE_ERROR)


def get_information(url: str) -> object:
    """
    Read data information and get remote CSV file path

    :param url: Path to file which which contains the data information
    :return: Object with title, author and data url
    """

    # Open url
    res = urllib.request.urlopen(url)

    # Read json file
    data = json.loads(res.read())

    # Get csv resource url
    global data_url
    for res in data['resources']:
        if res['format'] == "CSV":
            data_url = res['url']
            break

    # Show error message if no csv file has been found
    try:
        data_url

    except NameError:
        message("No CSV file found in the specified source.", MESSAGE_ERROR)
        sys.exit(0)

    return {
        "title": data['title'],
        "author": data['author'],
        "data_url": data_url,
        "license": {
            "title": data['license_title'],
            "url": data['license_url']
        }
    }


def download(url: str, keys: object, data_rows: object) -> object:
    """
    Download CSV data and write them with additional information into separate files

    :param url: Path to remote CSV file
    :param keys: Object of lists which contain positions of keys (headlines) inside the CSV file
    :param data_rows: Object describing first and lost row of data inside the CSV file
    :return: Object with path to locally created CSV file and positions of keys (headlines) inside it
    """

    # Create directory if not exists
    path = SOURCE_DIR + "/" + DATA_DIR
    if not os.path.exists(path):
        os.makedirs(path)

    # Open url
    file = path + "/" + DATA_FILENAME
    res = urllib.request.urlopen(url)
    contents = res.read().decode("ISO-8859-1")

    # Init lists which contain the keys
    keys_x = []
    keys_y = []
    for _ in keys['x']:
        keys_y.append([])

    # Test if CSV file is valid
    if not args.unsafe:
        try:
            csv.Sniffer().sniff(contents, delimiters=CSV_DELIMITER)
        except csv.Error:
            message("The requested CSV file is invalid. Please try again in a few minutes." + "\n" +
                    "Resource: {}", MESSAGE_ERROR, url)
            sys.exit(0)

    # Initialize reader
    cr = csv.reader(contents.split("\n"), delimiter=CSV_DELIMITER)

    # Read and write file contents
    with open(file, "w+") as outfile:

        # Initialize writer
        cw = csv.writer(outfile)

        # Get file contents
        contents = list(cr)

        # Get row number which contains last data
        if data_rows['last'] < 0:
            last_row = len(contents) + data_rows['last']
        elif data_rows['last'] > data_rows['first']:
            last_row = data_rows['last']
        else:
            return False

        # Read and write keys and data
        for i, row in enumerate(contents):

            # Read keys
            if i in keys['y']:
                keys_x.append([k for j, k in enumerate(row) if j not in keys['x']])

            elif i == keys['y'][-1] + 1:
                # Combine keys
                keys_tmp = []
                for j in range(len(keys_x[0])):
                    tk = keys_x[0][j]
                    for n in range(1, len(keys_x)):
                        tk = tk + " " + keys_x[n][j]
                    keys_tmp.append(tk)

                # Make list unique
                for j, k in enumerate(keys_x):
                    keys_x[j] = unique(keys_x[j])

                # Format keys
                for j, k in enumerate(keys_x):
                    keys_x[j] = ",".join(keys_x[j])

                # Write keys into csv file
                cw.writerow(["state"] + ([""] * (len(keys['y']) - 1)) + keys_tmp)

            # Read data
            if data_rows['first'] <= i <= last_row:
                cw.writerow(row)

                for j, k in enumerate(row):
                    if j in keys['x']:
                        keys_y[j].append(k)

    # Make keys unique
    for i, k in enumerate(keys_y):
        keys_y[i] = ",".join([d for j, d in enumerate(sorted(set(k)))])

    return {
        "file": DATA_DIR + "/" + DATA_FILENAME,
        "keys": {
            "x": keys_x,
            "y": keys_y
        }
    }


def save_information(info: object, file: str, keys: object):
    """
    Save information about downloaded CSV file in local info file

    :param info: Object containing information about downloaded CSV file
    :param file: Path to locally created CSV file
    :param keys: Object of lists which contain positions of keys (headlines) inside the local CSV file
    """

    # Get keys
    nationality = keys['x'][0].split(",")
    sex = keys['x'][1].split(",")
    state = keys['y'][0].split(",")
    semester = keys['y'][1].split(",")

    # Define json contents
    data = {
        "title": info['title'],
        "author": info['author'],
        "url": info['data_url'],
        "file": file,
        "attributes": {
            "nationality": nationality,
            "sex": sex,
            "state": state,
            "semester": semester
        },
        "license": info['license']
    }

    # Write data to json file
    with open(SOURCE_DIR + "/" + DATA_DIR + "/" + INFO_FILENAME, "w+", encoding="utf-8") as outfile:
        json.dump(data, outfile)


def get_source() -> object:
    """
    Get source data from local source file

    :return: Source data from local source file
    """

    # Read json source file
    with open(SOURCE_FILE) as file:
        contents = json.load(file)

    # Read sources from file
    url = contents['url']
    keys = contents['keys']
    data_rows = contents['data_rows']

    # Check validity of data rows
    if data_rows['last'] == 0:
        message("The last data row cannot be 0.", MESSAGE_ERROR)
        sys.exit(0)
    elif 0 < data_rows['last'] < data_rows['first']:
        message("Please specify a valid number for the last data row.", MESSAGE_ERROR)
        sys.exit(0)

    return {
        "url": url,
        "keys": keys,
        "data_rows": data_rows
    }


def message(text: str, state: int, *arguments: str):
    """
    Print message to console

    :param text: The message text
    :param state: The message state; can be MESSAGE_INFO, MESSAGE_SUCCESS or MESSAGE_ERROR
    :param arguments: Additional arguments which replace each {} inside the message text
    :return:
    """

    if not text or state not in [MESSAGE_INFO, MESSAGE_ERROR, MESSAGE_SUCCESS] or (args.quiet and state != MESSAGE_ERROR):
        return

    # Set message prefix and styles
    prefix = ""
    colors = {
        'start': "",
        'end': ""
    }
    arg_color = CYELLOW

    if state == MESSAGE_ERROR:
        prefix = "Error: "
        colors['start'] = CRED
        colors['end'] = CEND
    elif state == MESSAGE_SUCCESS:
        colors['start'] = CGREEN
        colors['end'] = CEND
        arg_color = CGREEN

    # Show message
    print((colors['start'] + prefix + text + colors['end']).format(*[arg_color + arg + CEND for arg in arguments]))


def unique(elements: list) -> list:
    """
    Make each element unique inside a specified list

    :param elements: List with elements which should be made unique
    :return: List with unique elements
    """

    unique_el = []
    [unique_el.append(x) for x in elements if x not in unique_el]

    return unique_el


# ======================================================================================================================

# Initialize arguments
parser = ArgumentParser()
parser.add_argument('-q', '--quiet', help="Disable output of status messages", action='store_true')
parser.add_argument('-u', '--unsafe', help="Skip CSV file check", action='store_true')
args = parser.parse_args()

# Execute main script
main()
