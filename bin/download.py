#!/usr/bin/python
import sys, os, csv, json, urllib.request, ssl, codecs

def main():
	# Get url
	source = getSource()

	# Get url information
	try:
		info = getInformation(source['url'])

	except urllib.error.URLError:
		print('Fehler: Es besteht anscheinend keine Verbindung zum Internet.')
		sys.exit(0)

	# Print data information
	print('[0] Datensatz "' + info['title'] + '" von "' + info['author'] + '" wird heruntergeladen.')

	# Save file
	dl = download(info['data_url'], source['keys'], source['data'])

	if dl != False:
		# Save information in file
		saveInformation(info, dl['file'], dl['keys'])

		# Print download result
		print('[1] Datensatz wurde erfolgreich heruntergeladen: ' + dl['file'])
	else:
		# Download not successful
		print('[1] Download fehlgeschlagen.')


def getInformation(url):
	# Open url
	context = ssl._create_unverified_context()
	res = urllib.request.urlopen(url, context=context)

	# Read json file
	data = json.loads(res.read())

	# Get csv resource url
	data_url = ""
	for res in data['resources']:
		if res['format'] == "CSV":
			data_url = res['url']
			break

	return {
		'title': data['title'],
		'author': data['author'],
		'data_url': data_url
	}


def download(url, keys, data):
	# Create directory if not exists
	path = "data"
	if not os.path.exists(path):
		os.makedirs(path)

	# Open url
	file = path + '/data.csv'
	context = ssl._create_unverified_context()
	res = urllib.request.urlopen(url, context=context)

	# Set key lists
	keys_x = []
	keys_y = []
	for i in keys['x']:
		keys_y.append([])
	
	# Read file contents
	with open(file, 'w+') as f:
		cr = csv.reader(codecs.iterdecode(res, 'ISO-8859-1'), delimiter=';')
		cw = csv.writer(f)

		for i, row in enumerate(cr):

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
			if i >= data[0] and i <= data[1]:
				cw.writerow(row)

				for j, k in enumerate(row):
					if j in keys['x']:
						keys_y[j].append(k)

	# Close file
	f.close()

	# Make keys unique
	for i, k in enumerate(keys_y):
		keys_y[i] = ','.join([d for j, d in enumerate(sorted(set(k)))])

	return {
		'file': file,
		'keys': {
			'x': keys_x,
			'y': keys_y
		}
	}


def saveInformation(info, file, keys):
	# Format keys
	keys_x = ';'.join([str(i) for i in keys['x']])
	keys_y = ';'.join([str(i) for i in keys['y']])

	# Open file
	f = codecs.open('data/info', 'w+', 'utf-8')

	# Write information into file
	f.write('title: ' + info['title'] + '\n')
	f.write('author: ' + info['author'] + '\n')
	f.write('url: ' + info['data_url'] + '\n')
	f.write('file: ' + file + '\n')
	f.write('keys_x: ' + keys_x + '\n')
	f.write('keys_y: ' + keys_y)

	# Close file
	f.close()


def getSource():
	# Open source file
	f = open('data/source', 'r')

	# Read sources from file
	url = f.readline()
	keys = f.readline()
	data = f.readline()
	f.close()

	# Replace unnecessary information
	url = formatData(url, 'url')
	keys = formatData(keys, 'keys')
	data = formatData(data, 'data')

	# Convert keys and data
	keys = keys.split('|')
	keys_x = keys[0].split(',')
	keys_y = keys[1].split(',')
	data = data.split(',')
	for i,k in enumerate(keys_x):
		keys_x[i] = int(k)
	for i,k in enumerate(keys_y):
		keys_y[i] = int(k)
	for i,d in enumerate(data):
		data[i] = int(d)

	return {
		'url': url,
		'keys': {
			'x': keys_x,
			'y': keys_y
		},
		'data': data
	}


def formatData(data, key):
	data = data.replace(key + ':', '')
	data = data.replace(' ', '')
	data = data.replace('\n', '')
	data = data.replace('\r', '')
	data = data.replace('\t', '')

	return data


def unique(data):
	# Make elements of data list unique
	unique = []
	for i in data:
		if i not in unique:
			unique.append(i)

	return unique


##########################################################################

main()