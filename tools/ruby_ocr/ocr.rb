require 'parallel'
# get all the files
# turn them into tiffs
# run tesseract over them
# save output wiuth the same name

def procdir(dir)
  Dir[ File.join(dir, '**', '*') ].reject { |p| File.directory? p }
end


pdfs = procdir('.').select{|f| File.extname(f) == '.pdf'}

Parallel.each(pdfs) { |p|
  `convert -density 300 -alpha Off -background white '#{p}' -depth 8 #{p.gsub('pdf', 'tiff')}`
}

tiffs = procdir('.').select{|f| File.extname(f) == '.tiff'}

Parallel.each(tiffs) { |p|
  `tesseract #{p} #{p.gsub('tiff','txt')}`
}


