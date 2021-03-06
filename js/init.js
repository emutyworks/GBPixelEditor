/*
GBPixelEditor

Copyright (c) 2022 emutyworks

Released under the MIT license
https://github.com/emutyworks/GBPixelEditor/blob/main/LICENSE
*/
var PALETTE_DOT = 16;
var CLIPBOARD_DOT = 2;
var HISTORY_DOT = 2;
var DATA_SIZE = 8 * 8;
var DATA_INDEX_MAX_SIZE = 4;

var OFFSET_X = 8;
var OFFSET_Y = 35;
var EDITOR_LINE = '#c0c000';
var EDITOR_LINE2 = '#c0c0c0';
var EDITOR_BOX = '#ff0000';
var EDITOR_BOX2 = '#0000ff';
var EDITOR_START_X = 80;
var EDITOR_START_Y = 75;
var EDITOR_BLOCK_SIZE = 64;
var PREVIEW_START_X = EDITOR_START_X;
var PREVIEW_START_Y = 0;
var PALETTE_START_X = 0;
var PALETTE_START_Y = EDITOR_START_Y;
var CLIPBOARD_MAX_CX = 16;
var CLIPBOARD_MAX_CY = 8;
var CLIPBOARD_SIZE = CLIPBOARD_DOT * 8 + 1;
var CLIPBOARD_MAX_X = CLIPBOARD_SIZE * CLIPBOARD_MAX_CX;
var CLIPBOARD_MAX_Y = CLIPBOARD_SIZE * CLIPBOARD_MAX_CY;
var CLIPBOARD_START_X = EDITOR_START_X + 16 + 16 * 8;
var CLIPBOARD_START_Y = EDITOR_START_Y;
var HISTORY_START_X = CLIPBOARD_START_X;
var HISTORY_START_Y = 48;
var HISTORY_MAX_X = 16;
var HISTORY_SIZE = HISTORY_DOT * 8 + 1;
var TOOLS_START_X = CLIPBOARD_START_X;
var TOOLS_START_Y = CLIPBOARD_START_Y - 50;
var TOOLS_H = 17;
var TOOLS_W = 85;

var VIEW_MAX_X = EDITOR_START_X + 128 + 16 + 2 + CLIPBOARD_MAX_X;
var VIEW_MAX_Y = EDITOR_START_Y + 2 + CLIPBOARD_MAX_Y;

var base = null;
var view = null;
var cursor = null;
var bctx = null;
var vctx = null;
var cctx = null;
var mouse_down = false;
var flag = false;
var edit_alert = false;
var tips_flag = false;
var edit_flag = false;
var editor_info = [];
var preview_info = [];
var edit_d = [];
var clipboard_d = [];
var history_d = [];
var fill_b = [];
var p_table = [];

var cur_info = {
  org_x: 0,
  org_y: 0,
  x: 0,
  y: 0,
  //editor
  dx: 0,
  dy: 0,
  //clipboard
  cx: 0,
  cy: 0,
  csel: null,
  cselx: 0,
  csely: 0,
  //history
  hx: 0,
  hsel: null,
  hselx: 0,
  //palette
  px: 0,
  py: 0,
};

var edit_size = {
  editor:{
    '8x8':{
      w: EDITOR_BLOCK_SIZE * 2,
      h: EDITOR_BLOCK_SIZE * 2,
      ds: 16,
      ix: 1,
      iy: 1,
      i: 1,
    },
    '8x16':{
      w: EDITOR_BLOCK_SIZE,
      h: EDITOR_BLOCK_SIZE * 2,
      ds: 8,
      ix: 1,
      iy: 2,
      i: 2,
    },
    '16x16':{
      w: EDITOR_BLOCK_SIZE * 2,
      h: EDITOR_BLOCK_SIZE * 2,
      ds: 8,
      ix: 2,
      iy: 2,
      i: 4,
    },
  },
  preview:{
    '8x8':{
      w: 32,
      h: 32,
      ds: 4,
      ix: 1,
      iy: 1,
      i: 1,
    },
    '8x16':{
      w: 32,
      h: 64,
      ds: 4,
      ix: 1,
      iy: 2,
      i: 2,
    },
    '16x16':{
      w: 64,
      h: 64,
      ds: 4,
      ix: 2,
      iy: 2,
      i: 4,
    },
  }
};

var tips_clipboard = ' <span class="tips">[Shift + LM]</span> Select the copy target. > Select the copy destination clipboard. ';
var tips_cancel = '<span class="tips">[ESC]</span> Cancel. ';
var tips_mes = {
  f_vertical1: 'Flip Vertical: Click the icon to flip vertical.',
  f_vertical24: 'Flip Vertical: Click the icon to flip vertical. ' + tips_cancel,
  f_horizontal1: 'Flip Horizontal: Click the icon to flip horizontal.',
  f_horizontal24: 'Flip Horizontal: Click the icon to flip horizontal. ' + tips_cancel,
  c_clockwise1: 'Counter Clockwise: Click the icon to rotate counter clockwise.',
  c_clockwise24: 'Counter Clockwise: Click the icon to rotate counter clockwise. ' + tips_cancel,
  clockwise1: 'Clockwise: Click the icon to rotate clockwise.',
  clockwise24: 'Clockwise: Click the icon to rotate clockwise. ' + tips_cancel,
  bucket: 'Bucket: Click the icon. > Select the editor area to paint. ' + tips_cancel,
  editor1: 'Editor: <span class="tips">[LM]</span> Draw dots.',
  editor24: 'Editor: <span class="tips">[LM]</span> Draw dots. <span class="tips">[Shift + LM]</span> Select the editor area to be changed. ' + tips_cancel,
  palette: 'Palette: <span class="tips">[LM]</span> Choose a color.',
  history: 'History: <span class="tips">[LM]</span> Select as copy target. > Select clipboard to copy target.' + tips_cancel,
  clipboard1: 'Clip Board: <span class="tips">[LM]</span> Set as edit target.' + tips_clipboard,
  clipboard24: 'Clip Board: <span class="tips">[LM]</span> Select as edit target. > Select editor to edit target.' + tips_clipboard + tips_cancel,
  edit_alert: 'Tips: Stop confirmation dialog.',
  reset: 'Tips: "LM" Left Mouse click.',
  first_editor: 'Please select the editor area to be changed.',
};

function init_palettes(){
  var fill_x = PALETTE_START_X;
  var fill_y = PALETTE_START_Y;
  var fill_w = PALETTE_DOT;
  var fill_h = PALETTE_DOT;
  var palette = pal_info['palette'];
  var cnt = pal_info['cnt'];

  for(var i=0; i<cnt; i++){
    var b = palettes[i];
    var p = [];
    var c = 3;
    
    for(var j=0; j<4; j++){
      p[c] = bin2dec(b.substring(j*2, j*2+2));
      c--;
    }
    p_table[i] = p.concat();
  }

  for(var i=0; i<cnt; i++){
    vdrowBox(fill_x, fill_y + fill_h * i, fill_w * 4, fill_h, EDITOR_LINE);
    for(var j=0; j<4; j++){
      bctx.fillStyle = get_color(i,j);
      bctx.fillRect(fill_x + fill_w * j, fill_y + fill_h * i, fill_w, fill_h);
    }
  }
  var index_x = pal_info['index'] * PALETTE_DOT;
  cdrowBox(PALETTE_START_X + index_x, PALETTE_START_Y + fill_h * palette, PALETTE_DOT, PALETTE_DOT, EDITOR_BOX);
}

function get_color(palette,index){
  var p = p_table[palette][index];
  return color_palettes[0][p];
}

function init_data(){
  var d = [];
  for(var i=0; i<DATA_SIZE; i++){
    d[i] = 0;
  }
  for(var i=0; i<CLIPBOARD_MAX_CX * CLIPBOARD_MAX_CY; i++){
    clipboard_d[i] = d.concat();
  }
  for(var i=0; i<HISTORY_MAX_X; i++){
    history_d[i] = d.concat();
  }
}

function init_view(){
  $('#base').attr({
    width: VIEW_MAX_X + 'px',
    height: VIEW_MAX_Y + 'px',
  });
  $('#view').attr({
    width: VIEW_MAX_X + 'px',
    height: VIEW_MAX_Y + 'px',
  });
  $('#cursor').attr({
    width: VIEW_MAX_X + 100 + 'px',
    height: VIEW_MAX_Y + 50 + 'px',
  });

  init_palettes();
  init_data();
  set_edit_size(true);
  init_clipboard();
  init_history();
  set_tips('reset');
}

function set_edit_size(f){
  if(edit_alert || f){
    flag = true;
  }else{
    flag = edit_confirm_alert('The data being edited will be reset. Do you want to resize the editor?');
  }
  if(flag){
    var e = $('[name=edit_size]').val();
    editor_info = {
      w: edit_size['editor'][e]['w'],
      h: edit_size['editor'][e]['h'],
      ds: edit_size['editor'][e]['ds'],
      ix: edit_size['editor'][e]['ix'],
      iy: edit_size['editor'][e]['iy'],
      i: edit_size['editor'][e]['i'],
      ci: null,
    };
    preview_info = {
      w: edit_size['preview'][e]['w'],
      h: edit_size['preview'][e]['h'],
      ds: edit_size['preview'][e]['ds'],
      ix: edit_size['preview'][e]['ix'],
      iy: edit_size['preview'][e]['iy'],
      i: edit_size['preview'][e]['i'],
    };

    edit_d = [];
    for(var i=0; i<editor_info['i']; i++){
      edit_d[i] = i;
    }

    init_palettes();
    init_editor();
    init_preview();
    set_edit_data();
    set_clipboard_cursor();
    edit_cancel();
    set_history_data();
  }
}

function reset_history_cursor(){
  var fill_x = HISTORY_START_X;
  var fill_y = HISTORY_START_Y;
  var fill_w = HISTORY_SIZE * HISTORY_MAX_X;
  var fill_h = HISTORY_SIZE;

  cctx.clearRect(fill_x, fill_y, fill_w + 1, fill_h + 1);
}

function init_history(){
  var fill_x = HISTORY_START_X;
  var fill_y = HISTORY_START_Y;
  var fill_w = HISTORY_SIZE * HISTORY_MAX_X;
  var fill_h = HISTORY_SIZE;

  bctx.fillStyle = get_color(pal_info['palette'],0);
  bctx.fillRect(fill_x, fill_y, fill_w, fill_h);

  bctx.fillStyle = EDITOR_LINE2;
  for(var i=1; i<HISTORY_MAX_X; i++){
    bctx.fillRect(fill_x + i * HISTORY_SIZE, fill_y, 1, fill_h);
  }
  bdrowBox(fill_x, fill_y, fill_w, fill_h, EDITOR_BOX);
  set_history_data();
}

function init_clipboard(){
  var fill_x = CLIPBOARD_START_X;
  var fill_y = CLIPBOARD_START_Y;
  var fill_w = CLIPBOARD_MAX_X;
  var fill_h = CLIPBOARD_MAX_Y;

  bctx.fillStyle = get_color(pal_info['palette'],0);
  bctx.fillRect(fill_x, fill_y, fill_w, fill_h);

  bctx.fillStyle = EDITOR_LINE2;
  for(var i=1; i<CLIPBOARD_MAX_CX; i++){
    bctx.fillRect(fill_x + CLIPBOARD_SIZE * i, fill_y, 1, fill_h);
  }
  for(var i=1; i<CLIPBOARD_MAX_CY; i++){
    bctx.fillRect(fill_x, fill_y + CLIPBOARD_SIZE * i, fill_w, 1);
  }

  bdrowBox(fill_x, fill_y, fill_w, fill_h, EDITOR_BOX);
  set_clipboard_data();
}

function init_editor(){
  var fill_x = EDITOR_START_X;
  var fill_y = EDITOR_START_Y;
  var fill_w = editor_info['w'];
  var fill_h = editor_info['h'];
  var ed = editor_info['ds'];
  var ex = editor_info['ix'];
  var ey = editor_info['iy'];

  bctx.clearRect(fill_x, fill_y, EDITOR_BLOCK_SIZE * 2 + 1, EDITOR_BLOCK_SIZE * 2 + 1);
  vctx.clearRect(fill_x, fill_y, EDITOR_BLOCK_SIZE * 2 + 1, EDITOR_BLOCK_SIZE * 2 + 1);

  bctx.fillStyle = get_color(pal_info['palette'],0);
  bctx.fillRect(fill_x, fill_y, fill_w, fill_h);

  bctx.fillStyle = EDITOR_LINE;
  for(var i=0; i<8 * ex; i++){
    bctx.fillRect(fill_x + ed * i, fill_y, 1, fill_h);
  }
  for(var i=0; i<8 * ey; i++){
    bctx.fillRect(fill_x, fill_y + ed * i, fill_w, 1);
  }
  bctx.fillStyle = EDITOR_LINE2;
  if(ex==2){
    bctx.fillRect(fill_x + fill_w / 2, fill_y, 1, fill_h);
  }
  if(ey==2){
    bctx.fillRect(fill_x, fill_y + fill_h / 2, fill_w, 1);
  }
  bdrowBox(fill_x, fill_y, fill_w, fill_h, EDITOR_BOX);
}

function init_preview(){
  var fill_x = PREVIEW_START_X;
  var fill_y = PREVIEW_START_Y;
  var fill_w = preview_info['w'] + 1;
  var fill_h = preview_info['h'] + 1;

  bctx.clearRect(fill_x, fill_y, 64 + 2, 64 + 2);
  vctx.clearRect(fill_x, fill_y, 64 + 2, 64 + 2);

  bctx.fillStyle = get_color(pal_info['palette'],0);
  bctx.fillRect(fill_x, fill_y, fill_w, fill_h);

  bdrowBox(fill_x, fill_y, fill_w, fill_h, EDITOR_BOX);
}

function bdrowBox(x,y,w,h,c){
  bctx.fillStyle = c;
  bctx.fillRect(x, y, 1, h);
  bctx.fillRect(x, y, w, 1);
  bctx.fillRect(x + w, y, 1, h);
  bctx.fillRect(x, y + h, w + 1, 1);
}
function vdrowBox(x,y,w,h,c){
  vctx.fillStyle = c;
  vctx.fillRect(x, y, 1, h);
  vctx.fillRect(x, y, w, 1);
  vctx.fillRect(x + w, y, 1, h);
  vctx.fillRect(x, y + h, w + 1, 1);
}
function cdrowBox(x,y,w,h,c){
  cctx.fillStyle = c;
  cctx.fillRect(x, y, 1, h);
  cctx.fillRect(x, y, w, 1);
  cctx.fillRect(x + w, y, 1, h);
  cctx.fillRect(x, y + h, w + 1, 1);
}

function edit_confirm_alert(mes){
  return window.confirm(mes);
}

function dec2Hex(v){
  var len = v.toString(16).length;
  return (('00' + v.toString(16).toUpperCase()).substring(len, len + 2));
}

function hex2bin(v){
  v = parseInt(v, 16);
  var len = v.toString(2).length;
  return ('00000000' + v.toString(2)).substring(len, len + 8);
}

function bin2dec(v){
  return parseInt(v, 2);
}