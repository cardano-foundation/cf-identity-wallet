# -*- coding: utf-8 -*-
import cssutils
import os

file_path = "../src/theme/variables.css"

#check if file is present
if os.path.isfile(file_path):
    #open text file in read mode
    text_file = open(file_path, "r")

    #read whole file to a string
    data = text_file.read()

    #close file
    text_file.close()

    print(data)
    
    sheet = cssutils.parseString(css)
    
    for rule in sheet:
        if rule.type == rule.STYLE_RULE:
            # find property
            for property in rule.style:
                if property.name == 'color':
                    property.value = 'green'
                    property.priority = 'IMPORTANT'
                    break
            # or simply:
            rule.style['margin'] = '01.0eM' # or: ('1em', 'important')
