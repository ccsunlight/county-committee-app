"""Convert certifield membership list pdfs into csvs.

This script assumes that the membership list pdfs are mostly tables.

The output CSV will have a few extraneous records and fields:
    * A single (unnamed) column a the begining that is a row index
    * Several records with the page number, and no other data
    * Several records with a repead of the header
"""
import glob

from tabula import read_pdf


def convert_pdfs_to_csvs(pdf_list):
    """Convert the list of pdfs into csvs.

    Write the CSVs to a local folder named 'csvs'.
    """
    for pdf_file in pdf_list:
        filename = pdf_file.split('/')[-1]
        base = filename.split('.pdf')[0]
        df = read_pdf(pdf_file, pages='all')
        with open("csvs/{}.csv".format(base), 'w') as output:
            df.to_csv(output)

if __name__ == "__main__":
    """Convert all Certified Membership List pdfs into CSVs."""
    cert_lists = glob.glob('County Committee Public Documents/**/*CertifiedList*.pdf', recursive=True)
    convert_pdfs_to_csvs(cert_lists)

