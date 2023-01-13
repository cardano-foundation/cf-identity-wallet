# -*- coding: utf-8 -*-
import cssutils
import os

file_path = "../src/theme/variables.css"
DEFAULT_ROOT = ":root"


if os.path.isfile(file_path):
    #open text file in read mode
    text_file = open(file_path, "r")

    #read whole file to a string
    data = text_file.read()

    #close file
    text_file.close()

    print(data)

    sheet = cssutils.parseString(data)
    print("sheet")
    print(sheet)
    for rule in sheet:
        print("rule")
        print(rule)
        if rule.type == rule.STYLE_RULE:
            # find property
            for property in rule.style:
               print('')

