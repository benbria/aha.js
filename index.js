/*
* The contents of this file are subject to the Mozilla Public License
* Version 1.1 (the "License"); you may not use this file except in
* compliance with the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
* Software distributed under the License is distributed on an "AS IS"
* basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
* License for the specific language governing rights and limitations
* under the License.
* Alternatively, the contents of this file may be used under the terms
* of the GNU Lesser General Public license (the "LGPL License"), in which case the
* provisions of LGPL License are applicable instead of those
* above.
*
* Copyright (c) 2014 Benbria.
* Derived from a work by Alexander Matthes (Ziz), zizsdl_at_googlemail.com
* found at https://github.com/theZiz/aha.
*/


/*
 * convert a Buffer of SGR-colored input into an HTML Buffer
 *
 * options:
 *  title: string (default: 'stdin')
 *  line_fix: boolean (default: false)
 *  no_header: boolean (default: false)
 *  word_wrap: boolean (default: false)
 *  colorschema: 'black' or 'pink', else normal
 *  iso: 1-15, or -1 (meaning utf-8) (default: -1)
 *  stylesheet: boolean (default: false)
 */
function aha(input, options) {
    if (typeof input == 'string') {
        throw new TypeError("expected buffer input");
    }
    options = options || {};
    var index = 0,
        output = [];
    function eof() {
        return index >= input.length;
    }
    function getNextChar() {
        return String.fromCharCode(input[index++]);
    }
    function write(s) {
        output.push(s);
    }

    function parseInsert(s) {
        var result = [],
            digit = [],
            pos = 0;
        for (pos = 0; pos < 1024; pos++) {
            if (s[pos] === '[') continue;
            if (pos === s.length || s[pos] === ';') {
                if (digit.length === 0) {
                    digit.push(0);
                }
                result.push(digit);
                digit = [];
                if (pos === s.length) {
                    break;
                }
            } else if (digit.length < 8) {
                digit.push(parseInt(s[pos]));
            }
        }
        return result;
    }
    var colorschema = options.colorschema === 'pink' ? 2 :
            options.colorschema === 'black' ? 1 : 0, // 0: normal, 1: black, 2: pink
        iso = -1, // utf8
        stylesheet = options.stylesheet || false,
        htop_fix = options.line_fix || false,
        line_break = 0,
        title = options.title,
        word_wrap = options.word_wrap || false,
        no_header = options.no_header || false;

    if (options.iso != null) {
        iso = parseInt(options.iso);
        if (iso < 1 || iso > 16) {
            throw new Error("not a valid ISO code: ISO 8859-" + options.iso);
        }
    }

    if (!no_header) {
        if (iso<0) {
            write("<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n");
        } else {
            write("<?xml version=\"1.0\" encoding=\"ISO-8859-" + iso + "\" ?><!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n");
        }
        write("<!-- This file was created with the aha Ansi HTML Adapter. http://ziz.delphigl.com/tool_aha.php -->\n");
        write("<html xmlns=\"http://www.w3.org/1999/xhtml\">\n");
        write("<head>\n<meta http-equiv=\"Content-Type\" content=\"application/xml+xhtml; charset=UTF-8\" />\n");
        if (title) {
            write("<title>" + title + "</title>\n");
        } else {
            write("<title>stdin</title>\n");
        }
        if (stylesheet) {
            write("<style type=\"text/css\">\n");
            switch (colorschema) {
                case 1:  write("body       {color: white; background-color: black;}\n");
                         write(".reset     {color: white;}\n");
                         write(".bg-reset  {background-color: black;}\n");
                         break;
                case 2:  write("body       {background-color: pink;}\n");
                         write(".reset     {color: black;}\n");
                         write(".bg-reset  {background-color: pink;}\n");
                         break;
                default: write(".reset     {color: black;}\n");
                         write(".bg-reset  {background-color: white;}\n");
            }
            if (colorschema!=1) {
                write(".black     {color: black;}\n");
                write(".red       {color: red;}\n");
                write(".green     {color: green;}\n");
                write(".yellow    {color: olive;}\n");
                write(".blue      {color: blue;}\n");
                write(".purple    {color: purple;}\n");
                write(".cyan      {color: teal;}\n");
                write(".white     {color: gray;}\n");
                write(".bg-black  {background-color: black;}\n");
                write(".bg-red    {background-color: red;}\n");
                write(".bg-green  {background-color: green;}\n");
                write(".bg-yellow {background-color: olive;}\n");
                write(".bg-blue   {background-color: blue;}\n");
                write(".bg-purple {background-color: purple;}\n");
                write(".bg-cyan   {background-color: teal;}\n");
                write(".bg-white  {background-color: gray;}\n");
            } else {
                write(".black     {color: black;}\n");
                write(".red       {color: red;}\n");
                write(".green     {color: lime;}\n");
                write(".yellow    {color: yellow;}\n");
                write(".blue      {color: #3333FF;}\n");
                write(".purple    {color: fuchsia;}\n");
                write(".cyan      {color: aqua;}\n");
                write(".white     {color: white;}\n");
                write(".bg-black  {background-color: black;}\n");
                write(".bg-red    {background-color: red;}\n");
                write(".bg-green  {background-color: lime;}\n");
                write(".bg-yellow {background-color: yellow;}\n");
                write(".bg-blue   {background-color: #3333FF;}\n");
                write(".bg-purple {background-color: fuchsia;}\n");
                write(".bg-cyan   {background-color: aqua;}\n");
                write(".bg-white  {background-color: white;}\n");
            }
            write(".underline {text-decoration: underline;}\n");
            write(".bold      {font-weight: bold;}\n");
            write(".blink     {text-decoration: blink;}\n");
            write("</style>\n");
        }
        if (word_wrap) {
            write("<style type=\"text/css\">pre {white-space: pre-wrap; white-space: -moz-pre-wrap !important;\n");
            write("white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word;}</style>\n");
        }
        write("</head>\n");
        if (stylesheet || !colorschema) {
            write("<body>\n");
        } else {
            switch (colorschema) {
                case 1: write("<body style=\"color:white; background-color:black\">\n"); break;
                case 2: write("<body style=\"background-color:pink\">\n"); break;
            }
        }

        write("<pre>\n");
    }

    // begin conversion
    var c,
        fc = -1, // standard foreground color
        bc = -1, // standard background color
        ul = 0, // not underlined
        bo = 0, // not bold
        bl = 0, // not blinking
        ofc, obc, oul, obo, obl, // old values of the above
        line = 0,
        momline = 0,
        newline = -1,
        temp;

    // read input one byte at a time (interpreted as an ASCII character code)
    while (!eof()) {
        c = getNextChar();
        if (c === '\033') {
            // save old values
            ofc = fc;
            obc = bc;
            oul = ul;
            obo = bo;
            obl = bl;
            // find the end of the sequence
            c = '0';
            var buffer = [];
            while (!eof() && (c < 'A' || (c > 'Z' && c < 'a') || c > 'z')) {
                c = getNextChar();
                buffer.push(c);
                if (c === '>') { // end of htop
                    break;
                }
            }
            buffer.length--;
            var elem;
            switch (c) {
                case 'm':
                    elem = parseInsert(buffer);
                    for (var i = 0; i < elem.length; i++) {
                        var digit = elem[i];
                        // jump over zeroes
                        var mompos = 0;
                        while (mompos < digit.length && digit[mompos] === 0) {
                            mompos++;
                        }
                        if (mompos === digit.length) { // only zeroes => delete all
                            bo = 0;
                            ul = 0;
                            bl = 0;
                            fc = -1;
                            bc = -1;
                        } else {
                            switch (digit[mompos]) {
                                case 1:
                                    bo = 1;
                                    break;
                                case 2:
                                    if (mompos + 1 < digit.length) {
                                        switch (digit[mompos + 1]) {
                                            case 1: // reset blink and bold
                                                bo = 0;
                                                bl = 0;
                                                break;
                                            case 4: // reset underline
                                                ul = 0;
                                                break;
                                            case 7: // reset inverted
                                                temp = bc;
                                                if (fc === -1 || fc === 9) {
                                                    if (colorschema != 1) {
                                                        bc = 0;
                                                    } else {
                                                        bc = 7;
                                                    }
                                                } else {
                                                    bc = fc;
                                                }
                                                if (temp === -1 || temp === 9) {
                                                    if (colorschema != 1) {
                                                        fc = 7;
                                                    } else {
                                                        fc = 0;
                                                    }
                                                } else {
                                                    fc = temp;
                                                }
                                                break;
                                        }
                                    }
                                    break;
                                case 3:
                                    if (mompos + 1 < digit.length) {
                                        fc = digit[mompos+1];
                                    }
                                    break;
                                case 4:
                                    if (mompos + 1 == digit.length) {
                                        ul = 1;
                                    } else {
                                        bc = digit[mompos+1];
                                    }
                                    break;
                                case 5:
                                    bl = 1;
                                    break;
                                case 7: // TODO: inverse
                                    temp = bc;
                                    if (fc === -1 || fc === 9) {
                                        if (colorschema != 1) {
                                            bc = 0;
                                        } else {
                                            bc = 7;
                                        }
                                    } else {
                                        bc = fc;
                                    }
                                    if (temp === -1 || temp === 9) {
                                        if (colorschema !== 1) {
                                            fc = 7;
                                        } else {
                                            fc = 0;
                                        }
                                    } else {
                                        fc = temp;
                                    }
                                    break;
                            }
                        }
                    }
                    break;
                case 'H':
                    if (htop_fix) { // dirty...
                        elem = parseInsert(buffer);
                        second = elem[1] || elem[0];
                        newline = second.digit[0]-1;
                        if (second.digit.length > 1) {
                            newline = (newline+1)*10+second.digit[1]-1;
                        }
                        if (second.digit.length > 2) {
                            newline = (newline+1)*10+second.digit[2]-1;
                        }
                        if (newline < line) {
                            line_break = 1;
                        }
                    }
                    break;
            }
            if (htop_fix && line_break) {
                for (; line < 80; line++) {
                    write(" ");
                }
            }
            // check differences
            if (fc !== ofc || bc !== obc || ul !== oul || bo !== obo || bl !== obl) { // any change
                if (ofc !== -1 || obc !== -1 || oul !== 0 || obo !== 0 || obl !== 0) {
                    write("</span>");
                }
                if (fc !== -1 || bc !== -1 || ul !== 0 || bo !== 0 || bl !== 0) {
                    if (stylesheet) {
                        write("<span class=\"");
                    } else {
                        write("<span style=\"");
                    }
                    switch (fc) {
                        case 0:
                            if (stylesheet) {
                                write("black ");
                            } else {
                                write("color:black;");
                            }
                            break; // black
                        case 1:
                            if (stylesheet) {
                                write("red ");
                            } else {
                                write("color:red;");
                            }
                            break; // red
                        case 2:
                            if (stylesheet) {
                                write("green ");
                            } else if (colorschema !== 1) {
                                write("color:green;");
                            } else {
                                write("color:lime;");
                            }
                            break; // green
                        case 3:
                            if (stylesheet) {
                                write("yellow ");
                            } else if (colorschema !== 1) {
                                write("color:olive;");
                            } else {
                                write("color:yellow;");
                            }
                            break; // yellow
                        case 4:
                            if (stylesheet) {
                                write("blue ");
                            } else if (colorschema !== 1) {
                                write("color:blue;");
                            } else {
                                write("color:#3333FF;");
                            }
                            break; // blue
                        case 5:
                            if (stylesheet) {
                                write("purple ");
                            } else if (colorschema !== 1) {
                                write("color:purple;");
                            } else {
                                write("color:fuchsia;");
                            }
                            break; // purple
                        case 6:
                            if (stylesheet) {
                                write("cyan ");
                            } else if (colorschema !== 1) {
                                write("color:teal;");
                            } else {
                                write("color:aqua;");
                            }
                            break; // cyan
                        case 7:
                            if (stylesheet) {
                                write("white ");
                            } else if (colorschema !== 1) {
                                write("color:gray;");
                            } else {
                                write("color:white;");
                            }
                            break; // white
                        case 9:
                            if (stylesheet) {
                                write("reset ");
                            } else if (colorschema !== 1) {
                                write("color:black;");
                            } else {
                                write("color:white;");
                            }
                            break; // reset
                    }
                    switch (bc) {
                        case 0:
                            if (stylesheet) {
                                write("bg-black ");
                            } else {
                                write("background-color:black;");
                            }
                            break; // black
                        case 1:
                            if (stylesheet) {
                                write("bg-red ");
                            } else {
                                write("background-color:red;");
                            }
                            break; // red
                        case 2:
                            if (stylesheet) {
                                write("bg-green ");
                            } else if (colorschema !== 1) {
                                write("background-color:green;");
                            } else {
                                write("background-color:lime;");
                            }
                            break; // green
                        case 3:
                            if (stylesheet) {
                                write("bg-yellow ");
                            } else if (colorschema !== 1) {
                                write("background-color:olive;");
                            } else {
                                write("background-color:yellow;");
                            }
                            break; // yellow
                        case 4:
                            if (stylesheet) {
                                write("bg-blue ");
                            } else if (colorschema !== 1) {
                                write("background-color:blue;");
                            } else {
                                write("background-color:#3333FF;");
                            }
                            break; // blue
                        case 5:
                            if (stylesheet) {
                                write("bg-purple ");
                            } else if (colorschema !== 1) {
                                write("background-color:purple;");
                            } else {
                                write("background-color:fuchsia;");
                            }
                            break; // purple
                        case 6:
                            if (stylesheet) {
                                write("bg-cyan ");
                            } else if (colorschema !== 1) {
                                write("background-color:teal;");
                            } else {
                                write("background-color:aqua;");
                            }
                            break; // cyan
                        case 7:
                            if (stylesheet) {
                                write("bg-white ");
                            } else if (colorschema !== 1) {
                                write("background-color:gray;");
                            } else {
                                write("background-color:white;");
                            }
                            break; // white
                        case 9:
                            if (stylesheet) {
                                write("bg-reset ");
                            } else if (colorschema === 1) {
                                write("background-color:black;");
                            } else if (colorschema === 2) {
                                write("background-color:pink;");
                            } else {
                                write("background-color:white;");
                            }
                            break; // reset
                    }
                    if (ul) {
                        if (stylesheet) {
                            write("underline ");
                        } else {
                            write("text-decoration:underline;");
                        }
                    }
                    if (bo) {
                        if (stylesheet) {
                            write("bold ");
                        } else {
                            write("font-weight:bold;");
                        }
                    }
                    if (bl) {
                        if (stylesheet) {
                            write("blink ");
                        } else {
                            write("text-decoration:blink;");
                        }
                    }

                    write("\">");
                }
            }
        } else if (c === '\r' && htop_fix) {
            for (; line < 80; line++)
                write(" ");
            line = 0;
            momline++;
            write("\n");
        } else if (c !== '\b') {
            line++;
            if (line_break) {
                write("\n");
                line = 0;
                line_break = 0;
                momline++;
            }
            if (newline >= 0) {
                while (newline > line) {
                    write(" ");
                    line++;
                }
                newline = -1;
            }
            switch (c) {
                case '&':  write("&amp;"); break;
                case '\"': write("&quot;"); break;
                case '<':  write("&lt;"); break;
                case '>':  write("&gt;"); break;
                case '\n': case 13: momline++;
                                    line=0;
                default:   write(c);
            }
            if (iso > 0) { //only at ISOS
                var cc = c.charCodeAt(0);
                if ((cc & 128) === 128) { //first bit set => there must be followbytes
                    var bits = 2;
                    if ((cc & 32) === 32) {
                        bits++;
                    }
                    if ((cc & 16) === 16) {
                        bits++;
                    }
                    for (var meow = 1; meow < bits; meow++) {
                        write(getNextChar());
                    }
                }
            }
        }
    }

    // footer
    if (fc !== -1 || bc !== -1 || ul !== 0 || bo !== 0 || bl !== 0) {
        write("</span>\n");
    }

    if (no_header == 0) {
        write("</pre>\n");
        write("</body>\n");
        write("</html>\n");
    }

    return new Buffer(output.join(''), 'ascii');
}

module.exports = aha;
