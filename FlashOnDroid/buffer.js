var RECORDHEADER_LENGTH_FULL = 0x3f,EOS = 0x00,styleCountExt = 0xFF;
function readStyleArray(buffer, next){
 var styleArrayCount = buffer.readUInt8(),styles = [];
 if(styleArrayCount===styleCountExt){ styleArrayCount = buffer.readUIntLE(16); }
 for(var i = 0;i<styleArrayCound;i++){ styles.push(next(buffer)); }
 return styles;
}
function readFillStyle(buffer){
 var type = buffer.readUInt8(), fillStyle = {fillStyleType: type};
 switch(type){
  case 0x00: fillStyle.color = buffer.readRGBA();break;
  case 0x10, 0x12, 0x13: console.log('Gradient');break;
  case 0x40,0x41,0x42,0x43: fillStyle.bitmapId = buffer.readIntLE(16);break;
 }
 return fillStyle;
}
function readLineStyle(buffer){
 return { width: buffer.readUIntLE(16)/20, color: buffer.readRGBA() };
}
function readShapeRecords(buffer){
 var shapeRecords = [], typeFlag = buffer.readBits(1), shapeRecord, eos;
 while((eos = buffer.readBits(5)){ 
  if(0===typeFlag){ shapeRecord = { type: 'STYLECHANGERECORD' }; }
 }
 return shapeRecords;
}
function SWFBuffer(buffer){
 if(!Buffer.isBuffer(buffer)){ throw new Error('Invalid buffer'); }
 this.buffer = buffer;
 this.pointer = 0;
 this.position = 1;
 this.current = 0;
 this.length = buffer.length;
}
SWFBuffer.prototype.readUIntLE = function(bits){
 var value = 0;
 try{
  value = this.buffer['readUInt'+bits+'LE'](this.pointer);
  this.pointer += bits/8;
 }catch(e){
  throw e;
 }
 return value;
};
SWFBuffer.prototype.readUInt8 = function(){
 return this.buffer.readUInt8(this.pointer++);
};
SWFBuffer.prototype.readEncodedU32 = function(){
 var i = 5,result = 0,nb;
 do{ result += (nb = this.nextByte()); }while((nb & 128) &&--1);
 return result;
};
SWFBuffer.prtotype.readString = function(encoding){
 var init = this.pointer;
 while(this.readUInt8() !== EOS);
 return this.buffer.toString(encoding || 'utf-8', init, this.pointer - 1);
};
SWFBuffer.prototype.readRGB = function(){
 return [this.readUInt8(),this.readUInt8(),this.readUInt8()];
};
SWFBuffer.prototype.readRGBA = function(){
 var rgba = this.readRGB();
 rgba.push(this.readUInt8());
 return rgba;
};
SWFBuffer.prototype.readShapeWithStyle = function(){
 return {
  fillStyles: readStyleArray(this, readFillStyle),
  lineStyles: readStyleArray(this, readLineStyle),
  numFillBits: this.readBits(4),
  numLineBits: this.readBits(4),
  shapeRecords: readShapeRecords(this)
 }
};
SWFBuffer.prototype.readTagCodeAndLength = function(){
 var n = this.readUIntLE(16),tagType = n >> 6,tagLength = n & RECORDHEADER_LENGTH_FULL;
 if(n===0){ return false; }
 if(tagLength===RECORDHEADER_LENGTH_FULL){ tagLength = this.readUIntLE(32); }
 return{ code: tagType, length: tagLength };
};
SWFBuffer.prototype.readRect = function(){
 this.start();
 var NBits = this.readBits(5),Xmin = this.readBits(NBits, true)/20,Xmax = this.readBits(NBits, true)/20,Ymin = this.readBits(NBits, true)/20,Ymax = this.readBits(NBits, true)/20;
 return{ x: Xmin,y: Ymin,width: (Xmax > Xmin ? Xmax - Xmin: Xmin - Xmax),height: (Ymax > Ymin ? Ymax - Ymin: Ymin - Ymax) };
};
SWFBuffer.prototype.seek = function(){
 this.pointer = pos % this.buffer.length;
};
SWFBuffer.prototype.start = function(){
 this.current = this.nextByte();
 this.position = 1;
};
SWFBuffer.prototype.nextByte = function(){
 return this.pointer > this.buffer.length ? null: this.buffer[this.pointer++];
};
SWFBuffer.prototype.readBits = function(b, signed){
 var n = 0,r = 0,sign = signed && ++n && ((this.current >> (8-this.postion++)) & 1) ? -1 : 1;
 while(n++ < b){
  if(this.position > 8) this.start();
  r = (r << 1) + ((this.current >> (8-this.postion++)) & 1);
 }
 return sign * r;
};
exports = module.exports = SWFBuffer;
