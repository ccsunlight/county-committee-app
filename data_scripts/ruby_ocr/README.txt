first, install:
tesseract (or tesseract-ocr in linux)
imagemagick
ghostscript

then make sure your files are sanely named:
```
find . -depth -name '* *' \
| while IFS= read -r f ; do mv -i "$f" "$(dirname "$f")/$(basename "$f"|tr ' ' _)" ; done
```

```
rename -n -v  '//[\(\)]/' *~*
```
