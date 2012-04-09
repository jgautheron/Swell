#!/usr/bin/env python

import re, os, glob, getopt, sys
from zlib import crc32
from Cheetah.Template import Template

class Swell_Parser():

    JS_EXT           = 'js'
    
    TEMPLATES_FOLDER = 'templates/'
    TEMPLATES_EXT    = '.tmpl'
    COMPILED_FOLDER  = 'compiled/'
    COMPILED_EXT     = '.html'
    PATH             = 'src/'

    overwrite        = False
    file             = None

    def __init__(self):
        try:
            opts, args = getopt.getopt(sys.argv[1:], '', ['overwrite'])
        except getopt.GetoptError, err:
            print str(err)
            sys.exit(2)

        for o, a in opts:
            if o == '--overwrite':
                self.overwrite = True
                            
        self.parseFiles()
        
    def parseFiles(self, srcPath = None):
        """
        Parses recursively the source folder, iterating recursively into each subfolder found
        Each javascript file found is parsed using two regular expressions:
            - the first looks for comment blocks
            - the second takes every recognized tag and text
        once the job done, everything is saved in an ordered dictionary in this order:
            1) classes[{'name', 'functions', 'attributes'}]
            2) block type:
                - functions[{'name','params','return','attributes'},]
                - properties[{'name'},]
                - events[{'name'},]
                
        @type  srcPath: string
        @param srcPath: folder path to iterate through
        """
        if srcPath is None:
            srcPath = self.PATH
            
        for file in glob.glob(os.path.join(srcPath, '*')):
            if os.path.isdir(file):
                self.parseFiles(file)
                continue
                
            if file.split('.')[-1] != self.JS_EXT:
                continue;
            fileContent = open(file).read()
                
            # checks for comment blocks
            docs = re.findall('/\*\*([\w\n\(\)\[\]\.\*\'\"\-#|,@{}_<>=:/ ]+?)\*/', fileContent)
            if not docs:
                continue

            classes = {}
            current = classes
            for doc in docs:
                tags = re.findall('(?:\* ([\w\d\(\),\.\'\"\-\:#|/ ]+)|(?<= @)(\w+)(?: (.+))?)', doc)
                if not tags:
                    continue
                    
                for tag in tags:
                    if tag[1] == 'class':
                        if not classes.has_key('classes'):
                            classes['classes'] = []
                        classes['classes'].append({ tag[2] : {'cfg' : self.processTags('class', tags)} })
                        current = classes['classes'][-1][tag[2]]
                    elif tag[1] == 'function':
                        if not current.has_key('functions'):
                            current['functions'] = []
                        current['functions'].append(self.processTags('function', tags))
                    elif tag[1] == 'property':
                        if not current.has_key('properties'):
                            current['properties'] = []
                        current['properties'].append(tags)
                    elif tag[1] == 'event':
                        if not current.has_key('events'):
                            current['events'] = []
                        current['events'].append(tags)

            # sort by functions name
            if current.has_key('functions'):
                current['functions'] = self.sortList(current['functions'], 'name')
            
            self.file = file
            self.generateTemplate(classes)

    def processTags(self, type, tags):
        """
        Processes a tags list of a given type and reorganizes these as a dictionary with meaningful key names splitted by tag type
        
        @type  type: string
        @param type: tags type
        @type  tags: list
        @param tags: unordered tags list
        @rtype:      dict
        @return:     the reordered tags
        """
        processedTags = {}
        if type == 'function':
            for tag in tags:
                # plain text
                if tag[0]:
                    if not processedTags.has_key('desc'):
                        processedTags['desc'] = ''
                    processedTags['desc'] = ' '.join([processedTags['desc'], tag[0].strip()])
                # @function name
                elif tag[1] == 'function':
                    processedTags['name'] = tag[2]
                # @param type name desc
                elif tag[1] == 'param':
                    if not processedTags.has_key('params'):
                        processedTags['params'] = {'names' : []}
                    param, paramValues = tag[2].split(), {}
                    
                    paramValues['name'] = param[1]
                    paramValues['type'] = re.match('{?(\w+)}?', param[0]).group(1)
                    paramValues['desc'] = '' if len(param) < 2 else ' '.join(param[2:]).strip()
                    processedTags['params']['values'] = paramValues                
                    processedTags['params']['names'].append(param[1])
                # @return type desc
                elif tag[1] == 'return':
                    returnTag, returnValues = tag[2].split(), {}
                    returnValues['type'] = re.match('{?(\w+)}?', returnTag[0]).group(1)
                    returnValues['desc'] = '' if len(returnTag) < 2 else ' '.join(returnTag[1:]).strip()
                    processedTags['return'] = returnValues
                # @see URL
                elif tag[1] == 'see':
                    if not processedTags.has_key('see'):
                        processedTags['see'] = []
                    processedTags['see'].append(tag[2])
                # @static @private ...
                elif tag[1] and not tag[2]:
                    if not processedTags.has_key('attributes'):
                        processedTags['attributes'] = []
                    processedTags['attributes'].append(tag[1])
        
        elif type == 'class':
            processedTags = {'namespace' : '', 'attributes' : []}
            for tag in tags:
                # plain text
                if tag[0]:
                    if not processedTags.has_key('desc'):
                        processedTags['desc'] = ''
                    processedTags['desc'] = ' '.join([processedTags['desc'], tag[0].strip()])
                # @class name
                elif tag[1] == 'class':
                    processedTags['name'] = tag[2]
                # @namespace name
                elif tag[1] == 'namespace':
                    processedTags['namespace'] = tag[2]
                # @augments class
                elif tag[1] == 'augments':
                    if not processedTags.has_key('augments'):
                        processedTags['augments'] = []
                    processedTags['augments'].append(tag[2])
                # @inherits class
                elif tag[1] == 'inherits':
                    if not processedTags.has_key('inherits'):
                        processedTags['inherits'] = []
                    processedTags['inherits'].append(tag[2])
                # @static @private ...
                elif tag[1] and not tag[2]:
                    processedTags['attributes'].append(tag[1])
        
        return processedTags

    def generateTemplate(self, doc):
        """
        Compiles in HTML and saves the template with the specified values (one file per class/namespace)
        Before saving, a CRC32 check is made to ensure the necessity of overwriting the file
        
        @type  doc: list
        @param doc: classes/namespaces found in the file
        """
        for type, namespace in doc.items():
            if type == 'classes':
                for classObj in namespace:
                    className = classObj.keys()[0]
                    filename = '.'.join([classObj[className]['cfg']['namespace'], className]) if classObj[className]['cfg']['namespace'] else className
                    tplValues = {'doc' : classObj[className], 'file' : self.file}
                    tplContent = Template(file=self.TEMPLATES_FOLDER + 'class' + self.TEMPLATES_EXT, searchList=[tplValues]).respond()
                    
                    tplFile = open(self.COMPILED_FOLDER + filename + self.COMPILED_EXT, 'w+')
                    # overwrites the file only if necessary
                    if crc32(tplContent) != crc32(tplFile.read()) or self.overwrite:
                        tplFile.write(tplContent)
                    tplFile.close()

    def sortList(self, L, fieldName):
        """
        Sorts the given list of dictionaries by the specified key
        using the Decorate-Sort-Undecorate pattern
        
        @type          L: list
        @param         L: list to sort
        @type  fieldName: string
        @param fieldName: dictionary key
        @rtype          : list
        @return         : sorted list
        """
        decoratedList = [(x[fieldName], x) for x in L]
        decoratedList.sort()
        return [y for (x, y) in decoratedList]

Swell_Parser()

