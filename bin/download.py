#!/usr/bin/python
import sys, os, csv, json, urllib.request, ssl, codecs

CEND = '\033[0m'
CITALIC = '\33[3m'
CSELECTED = '\33[7m'
CGREEN = '\33[32m'
CRED = '\033[91m'

SOURCE_DIR = "src"
DATA_DIR = "data"
DATA_FILENAME = "data.csv"
INFO_FILENAME = "info.json"
SOURCE_FILE = "data/source.json"

def main():
	# Get source data
	source = getSource()

	# Get url information
	try:
		info = getInformation(source['url'])

	except urllib.error.URLError:
		print(CRED + 'Error: There is probably no active internet connection.' + CEND)
		sys.exit(0)

	# Print data information
	print('Downloading: ' + CITALIC + info['title'] + CEND + ' by ' + CITALIC + info['author'] + CEND)

	# Write contents of downloaded file
	dl = download(info['data_url'], source['keys'], source['data_rows'])

	if dl != False:
		# Save information in file
		saveInformation(info, dl['file'], dl['keys'])

		# Print download result
		print(CGREEN + 'Download successful: ' + dl['file'] + CEND)
	else:
		# Download not successful
		print(CRED + 'Download failed.' + CEND)


def getInformation(url):
	# Open url
	context = ssl._create_unverified_context()
	res = urllib.request.urlopen(url, context=context)

	# Read json file
	data = json.loads(res.read())

	# Get csv resource url
	for res in data['resources']:
		if res['format'] == "CSV":
			data_url = res['url']
			break

	# Show error message if no csv file has been found
	try:
		data_url
	except NameError:
		print(CRED + 'Error: No CSV file found in the specified source.' + CEND)
		sys.exit(0)

	return {
		'title': data['title'],
		'author': data['author'],
		'data_url': data_url
	}


def download(url, keys, data_rows):
	# Create directory if not exists
	path = SOURCE_DIR + "/" + DATA_DIR
	if not os.path.exists(path):
		os.makedirs(path)

	# Open url
	file = path + "/" + DATA_FILENAME
	context = ssl._create_unverified_context()
	res = urllib.request.urlopen(url, context=context)

	# Init lists which contain the keys
	keys_x = []
	keys_y = []
	for i in keys['x']:
		keys_y.append([])
	
	# Read and write file contents
	with open(file, 'w+') as outfile:
		# Initialize reader and writer
		cr = csv.reader(codecs.iterdecode(res, 'ISO-8859-1'), delimiter=';')
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

			elif i == keys['y'][-1]+1:
				# Combine keys
				keys_tmp = []
				for j in range(len(keys_x[0])):
					tk = keys_x[0][j]
					for n in range(1, len(keys_x)):
						tk = tk + ' ' + keys_x[n][j]
					keys_tmp.append(tk)

				# Make list unique
				for j, k in enumerate(keys_x):
					keys_x[j] = unique(keys_x[j])

				# Format keys
				for j, k in enumerate(keys_x):
					keys_x[j] = ','.join(keys_x[j])

				# Write keys into csv file
				cw.writerow(["state"] + ([None] * (len(keys['y'])-1)) + keys_tmp)

			# Read data
			if i >= data_rows['first'] and i <= last_row:
				cw.writerow(row)

				for j, k in enumerate(row):
					if j in keys['x']:
						keys_y[j].append(k)

	# Make keys unique
	for i, k in enumerate(keys_y):
		keys_y[i] = ','.join([d for j, d in enumerate(sorted(set(k)))])

	return {
		'file': DATA_DIR + "/" + DATA_FILENAME,
		'keys': {
			'x': keys_x,
			'y': keys_y
		}
	}


def saveInformation(info, file, keys):
	# Get keys
	nationality = keys['x'][0].split(',')
	sex = keys['x'][1].split(',')
	state = keys['y'][0].split(',')
	semester = keys['y'][1].split(',')

	# Define json contents
	data = {
		'title': info['title'],
		'author': info['author'],
		'url': info['data_url'],
		'file': file,
		'attributes': {
			'nationality': nationality,
			'sex': sex,
			'state': state,
			'semester': semester
		}
	}

	# Write data to json file
	with open(SOURCE_DIR + "/" + DATA_DIR + "/" + INFO_FILENAME, 'w+', encoding='utf-8') as outfile:
		json.dump(data, outfile)


def getSource():
	# Read json source file
	with open(SOURCE_FILE) as file:
		contents = json.load(file)

	# Read sources from file
	url = contents['url']
	keys = contents['keys']
	data_rows = contents['data_rows']

	# Check validity of data rows
	if data_rows['last'] == 0:
		print(CRED + 'Error: The last data row cannot be 0.' + CEND)
		sys.exit(0)
	elif data_rows['last'] > 0 and data_rows['last'] < data_rows['first']:
		print(CRED + 'Error: Please specify a valid number for the last data row.' + CEND)
		sys.exit(0)

	return {
		'url': url,
		'keys': keys,
		'data_rows': data_rows
	}


def unique(data):
	# Make elements of data list unique
	unique = []
	for i in data:
		if i not in unique:
			unique.append(i)

	return unique


##########################################################################

main()
