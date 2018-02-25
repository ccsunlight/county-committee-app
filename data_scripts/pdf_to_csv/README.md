# Convert PDF tables to CSV

## Installation

Run `pip install -r requirements`.

## Usage

Download the [Source Documents](https://drive.google.com/drive/folders/1ywVUYMEJ2VesG_rJWHBaRJ5cr_yNwww-), and unzip into a folder.

Copy the script `convert_commitee_list_to_csv.py` to the unzipped folder.

Create the output directory: `mkdir csvs`.

Run the script with `python convert_committee_list_to_csv.py`.

## Notes

All the PDFs with the words `CertifiedList` somewhere in the filename will be
converted to CSVs.  To change this, modify the line starting with
`cert_lists = glob.glob` in the script.

The output CSVs aren't quite perfect:
* A single (unnamed) column is included that is a row index
* There are several repeats of the header throughout the CSV
* There are several (mostly empty) records that only contain the original PDF page number

