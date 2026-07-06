/* =============================================================
 *  faces.js  —  Verdal: A Tamer's Journey
 *  Original facial-expression artwork by James (see CREDITS.md).
 *  Five expressions per tamer: Happy, Neutral, Worried, Surprised,
 *  Fainted. Called by the trainer draw functions based on the face
 *  index globals, and used to make tamers emote during battle.
 * ============================================================= */

function rexHappyF() {

  //happy face
  fill('lightpink')
  beginShape()
  curveVertex(120,163)
  curveVertex(120,163)
  curveVertex(132,162)
  curveVertex(129,173)
  curveVertex(123,171)
  curveVertex(117,163+1.5)
  endShape(CLOSE)
  
  line(122,151,121,154)
  line(121,154,124,156)
  
  beginShape()
  curveVertex(133+4,143)
  curveVertex(133+4,143)
  curveVertex(145,140-1)
  curveVertex(150,143)
  curveVertex(150,143.5)
  curveVertex(145,140.5-1)
  curveVertex(133+4,143.5)
  curveVertex(133+4,143.5)
  endShape(CLOSE)
  
  line(110,145,99,140-1)
  line(102,141,100,150)
  
  fill(255)
  ellipse(108,150,10,20)
  push()
  fill(0)
  ellipse(108,150-2,10-1,15)
  pop()
  ellipse(108-1,150-3.5,10-7,20-13)
  
  ellipse(145,150,10,20)
  push()
  fill(0)
  ellipse(145,150-2,10-1,20-5)
  pop()
  ellipse(145-1,150-3.5,10-7,20-13)
  
  line(142,162+1,148,162+0.5)
  line(103,162,110,162)
  

}

function rexNeutralF() {

  //neutral face
  line(115,173,132,173)
  line(120,178,128,178)
    
  line(117,170-3,120,165-1)
  
  beginShape()
  curveVertex(133+4,143)
  curveVertex(133+4,143)
  curveVertex(145,140-1)
  curveVertex(150,143)
  curveVertex(150,143.5)
  curveVertex(145,140.5-1)
  curveVertex(133+4,143.5)
  curveVertex(133+4,143.5)
  endShape(CLOSE)
  
  line(110,145,99,140-1)
  line(102,141,100,150)
  
  fill(255)
  ellipse(108,150,10,20)
  push()
  fill(0)
  ellipse(108,150-2,10-1,15)
  pop()
  ellipse(108-1,150-3.5,10-7,20-13)
  
  ellipse(145,150,10,20)
  push()
  fill(0)
  ellipse(145,150-2,10-1,20-5)
  pop()
  ellipse(145-1,150-3.5,10-7,20-13)
  
  line(142,162+1,148,162+0.5)
  line(103,162,110,162)
  

}

function rexWorriedF() {

  line(120,172,122+3,166)
  line(122+3,166,129+2,172)
  
  beginShape()
  curveVertex(133+4,143)
  curveVertex(133+4,143)
  curveVertex(145,140-1)
  curveVertex(150,143)
  curveVertex(150,143.5)
  curveVertex(145,140.5-1)
  curveVertex(133+4,143.5)
  curveVertex(133+4,143.5)
  endShape(CLOSE)
  
  line(110,145,99,140-1)
  line(102,141,100,150)
  
  fill(255)
  ellipse(108,150,10,20)
  push()
  fill(0)
  ellipse(108,150-2,10-1,15)
  pop()
  ellipse(108-1,150-3.5,10-7,20-13)
  
  ellipse(145,150,10,20)
  push()
  fill(0)
  ellipse(145,150-2,10-1,20-5)
  pop()
  ellipse(145-1,150-3.5,10-7,20-13)
  
  line(142,162+1,148,162+0.5)
  line(103,162,110,162)

}

function rexSurprisedF() {

  fill('lightpink')
  ellipse(122+3,166,15)
  
  beginShape()
  curveVertex(133+4,143)
  curveVertex(133+4,143)
  curveVertex(145,140-1)
  curveVertex(150,143)
  curveVertex(150,143.5)
  curveVertex(145,140.5-1)
  curveVertex(133+4,143.5)
  curveVertex(133+4,143.5)
  endShape(CLOSE)
  
  line(110,145,99,140-1)
  line(102,141,100,150)
  
  fill(255)
  ellipse(108,150,10,20)
  push()
  fill(0)
  ellipse(108,150-2,10-1,15)
  pop()
  ellipse(108-1,150-3.5,10-7,20-13)
  
  ellipse(145,150,10,20)
  push()
  fill(0)
  ellipse(145,150-2,10-1,20-5)
  pop()
  ellipse(145-1,150-3.5,10-7,20-13)
  
  line(142,162+1,148,162+0.5)
  line(103,162,110,162)

}

function rexDeadF() {

  line(117+3,173,127+3,164)
  line(116+1+3,162+2,126+3,173)
  
  line(99,143,111-3,150)
  line(107-1,140+2,101,151)
  
  line(136,141,148,150)
  line(146,140,138,151)

}

function kaiHappyF() {

  fill('lightpink')
  beginShape()
  curveVertex(130,180-3)
  curveVertex(130,180-3)
  curveVertex(160,170)
  curveVertex(160,185)
  curveVertex(150,192)
  curveVertex(140,190)
  curveVertex(130,180-3)
  curveVertex(130,180-3)
  endShape()
  
  fill(255)
  beginShape()
  curveVertex(115,168)
  curveVertex(115,168)
  curveVertex(117,150-2)
  curveVertex(125,150)
  curveVertex(130-3,168)
  curveVertex(114,168)
  endShape(CLOSE)
  push()
  fill(0)
  ellipse(125-3.5,160-2,6,15)
  fill(255)
  ellipse(125-3.5-0.5,160-2-3.5,2.5,10-5)
  fill(113,55,13)
  ellipse(125-3.5,160-2,3,10-4)
  pop()
  
  beginShape()
  curveVertex(160-2,170-5)
  curveVertex(160-2,170-5)
  curveVertex(160-2,145)
  curveVertex(170-2,150-2-2)
  curveVertex(173,160+3)
  curveVertex(160,160+3)
  endShape(CLOSE)
  
  push()
  fill(0)
  ellipse(165,155,6,13)
  fill(255)
  ellipse(165-0.5,155-3.5,5-2.5,10-5)
  fill(113,55,13)
  ellipse(165,155,3,10-4)
  pop()
  
  line(135,165,136,167)
  line(135,165,136,163)
  
  line(116,173,116+10,173)
  line(158,162,172+2,164)
  
  push()
  strokeWeight(2)  
  line(152,148+2,159,143)
  line(159,143,170-2,144-4)
  
  line(112,145,118,147)
  pop()
  
  line(117,176,126,175)
  line(126,175,120,180-2)
  line(123-3,180-2,125,181-3)
  
  line(163,170,171,167)
  line(171,167,166,171)
  line(166,171,171,173-3)

}

function kaiNeutralF() {

  line(134,182,149+4,182-2)
  line(141,189,149,189-1)
  
  fill(255)
  beginShape()
  curveVertex(115,168)
  curveVertex(115,168)
  curveVertex(117,150-2)
  curveVertex(125,150)
  curveVertex(130-3,168)
  curveVertex(114,168)
  endShape(CLOSE)
  push()
  fill(0)
  ellipse(125-3.5,160-2,6,15)
  fill(255)
  ellipse(125-3.5-0.5,160-2-3.5,2.5,10-5)
  fill(113,55,13)
  ellipse(125-3.5,160-2,3,10-4)
  pop()
  
  beginShape()
  curveVertex(160-2,170-5)
  curveVertex(160-2,170-5)
  curveVertex(160-2,145)
  curveVertex(170-2,150-2-2)
  curveVertex(173,160+3)
  curveVertex(160,160+3)
  endShape(CLOSE)
  
  push()
  fill(0)
  ellipse(165,155,6,13)
  fill(255)
  ellipse(165-0.5,155-3.5,5-2.5,10-5)
  fill(113,55,13)
  ellipse(165,155,3,10-4)
  pop()
  
  line(135,165,136,167)
  line(135,165,136,163)
  
  line(116,173,116+10,173)
  line(158,162,172+2,164)
  
  push()
  strokeWeight(2)  
  line(152,148+2,159,143)
  line(159,143,170-2,144-4)
  
  line(112,145,118,147)
  pop()
  
  line(117,176,126,175)
  line(126,175,120,180-2)
  line(123-3,180-2,125,181-3)
  
  line(163,170,171,167)
  line(171,167,166,171)
  line(166,171,171,173-3)

}

function kaiWorriedF() {

  line(137,186,142,176)
  line(142,176,151,186-2)
  
  fill(255)
  beginShape()
  curveVertex(115,168)
  curveVertex(115,168)
  curveVertex(117,150-2)
  curveVertex(125,150)
  curveVertex(130-3,168)
  curveVertex(114,168)
  endShape(CLOSE)
  push()
  fill(0)
  ellipse(125-3.5,160-2,6,15)
  fill(255)
  ellipse(125-3.5-0.5,160-2-3.5,2.5,10-5)
  fill(113,55,13)
  ellipse(125-3.5,160-2,3,10-4)
  pop()
  
  beginShape()
  curveVertex(160-2,170-5)
  curveVertex(160-2,170-5)
  curveVertex(160-2,145)
  curveVertex(170-2,150-2-2)
  curveVertex(173,160+3)
  curveVertex(160,160+3)
  endShape(CLOSE)
  
  push()
  fill(0)
  ellipse(165,155,6,13)
  fill(255)
  ellipse(165-0.5,155-3.5,5-2.5,10-5)
  fill(113,55,13)
  ellipse(165,155,3,10-4)
  pop()
  
  line(135,165,136,167)
  line(135,165,136,163)
  
  line(116,173,116+10,173)
  line(158,162,172+2,164)
  
  push()
  strokeWeight(2)  
  line(152,148+2,159,143)
  line(159,143,170-2,144-4)
  
  line(112,145,118,147)
  pop()
  
  line(117,176,126,175)
  line(126,175,120,180-2)
  line(123-3,180-2,125,181-3)
  
  line(163,170,171,167)
  line(171,167,166,171)
  line(166,171,171,173-3)
  

}

function kaiSurprisedF() {

  fill('lightpink')
  ellipse(144,180,15)
  
  fill(255)
  beginShape()
  curveVertex(115,168)
  curveVertex(115,168)
  curveVertex(117,150-2)
  curveVertex(125,150)
  curveVertex(130-3,168)
  curveVertex(114,168)
  endShape(CLOSE)
  push()
  fill(0)
  ellipse(125-3.5,160-2,6,15)
  fill(255)
  ellipse(125-3.5-0.5,160-2-3.5,2.5,10-5)
  fill(113,55,13)
  ellipse(125-3.5,160-2,3,10-4)
  pop()
  
  beginShape()
  curveVertex(160-2,170-5)
  curveVertex(160-2,170-5)
  curveVertex(160-2,145)
  curveVertex(170-2,150-2-2)
  curveVertex(173,160+3)
  curveVertex(160,160+3)
  endShape(CLOSE)
  
  push()
  fill(0)
  ellipse(165,155,6,13)
  fill(255)
  ellipse(165-0.5,155-3.5,5-2.5,10-5)
  fill(113,55,13)
  ellipse(165,155,3,10-4)
  pop()
  
  line(135,165,136,167)
  line(135,165,136,163)
  
    line(116,173,116+10,173)
  line(158,162,172+2,164)
  
  push()
  strokeWeight(2)  
  line(152,148+2,159,143)
  line(159,143,170-2,144-4)
  
  line(112,145,118,147)
  pop()
  
  line(117,176,126,175)
  line(126,175,120,180-2)
  line(123-3,180-2,125,181-3)
  
  line(163,170,171,167)
  line(171,167,166,171)
  line(166,171,171,173-3)

}

function kaiDeadF() {

  line(143-1,188,152,176)
  line(135+5,178,153,187)
  
  line(114,152,126,161)
  line(125,150,116,161)
  
  line(156,147,168,153)
  line(165,144,157+2,154+1)
  
  line(135,165,136,167)
  line(135,165,136,163)

}

function miraHappyF() {

  fill('lightpink')
  beginShape()
  curveVertex(130,170)
  curveVertex(130,170)
  curveVertex(145,170-2)
  curveVertex(140,183)
  curveVertex(135,180)
  // curveVertex(135,180)
  endShape(CLOSE)
  
  push()
  fill(15, 48, 91)
  beginShape()
  curveVertex(118-5,170)
  curveVertex(118-5,170)
  curveVertex(110,160)
  curveVertex(110,150)
  curveVertex(115,148)
  curveVertex(118,160)
  curveVertex(120,170)
  curveVertex(120,170)
  endShape()
  line(115-4,169+2,123,168+2)
  
  
  beginShape()
  curveVertex(150,160)
  curveVertex(150,160)
  curveVertex(150-5,140)
  curveVertex(152-1,140)
  curveVertex(154,150)
  curveVertex(156,160-2)
  curveVertex(156,160-2)
  endShape()
  line(148,159+1,158,159-1)
  pop()

  fill(255)
  ellipse(112+1,154,7,12)
  
  beginShape()
  curveVertex(147,148)
  curveVertex(147,148)
  curveVertex(145,139)
  curveVertex(151,141)
  curveVertex(153,146)
  curveVertex(151,149)
  curveVertex(148,150)
  curveVertex(148,150)
  endShape(CLOSE)
  
  line(102,147,108,143)
  line(108,143,118,144)
  
  line(110,149+2,107,154+3)
  line(108,153,106,153)
  line(107,157,105,156+1)
  
  line(138,138,141,134)
  line(141,134,153,134)
  line(145,138,154,142)
  line(151,140,152,137)
  line(154,142,156,138)

}

function miraNeutralF() {

  line(132,174,146,173-2)
  line(134+4,180-2,143,177)
  
  push()
  fill(15, 48, 91)
  beginShape()
  curveVertex(118-5,170)
  curveVertex(118-5,170)
  curveVertex(110,160)
  curveVertex(110,150)
  curveVertex(115,148)
  curveVertex(118,160)
  curveVertex(120,170)
  curveVertex(120,170)
  endShape()
  line(115-4,169+2,123,168+2)
  
  
  beginShape()
  curveVertex(150,160)
  curveVertex(150,160)
  curveVertex(150-5,140)
  curveVertex(152-1,140)
  curveVertex(154,150)
  curveVertex(156,160-2)
  curveVertex(156,160-2)
  endShape()
  line(148,159+1,158,159-1)
  pop()

  fill(255)
  ellipse(112+1,154,7,12)
  
  beginShape()
  curveVertex(147,148)
  curveVertex(147,148)
  curveVertex(145,139)
  curveVertex(151,141)
  curveVertex(153,146)
  curveVertex(151,149)
  curveVertex(148,150)
  curveVertex(148,150)
  endShape(CLOSE)
  
  line(102,147,108,143)
  line(108,143,118,144)
  
  line(110,149+2,107,154+3)
  line(108,153,106,153)
  line(107,157,105,156+1)
  
  line(138,138,141,134)
  line(141,134,153,134)
  line(145,138,154,142)
  line(151,140,152,137)
  line(154,142,156,138)

}

function miraWorriedF() {

  line(134,178,138,171)
  line(138,171,146,176)
  
  push()
  fill(15, 48, 91)
  beginShape()
  curveVertex(118-5,170)
  curveVertex(118-5,170)
  curveVertex(110,160)
  curveVertex(110,150)
  curveVertex(115,148)
  curveVertex(118,160)
  curveVertex(120,170)
  curveVertex(120,170)
  endShape()
  line(115-4,169+2,123,168+2)
  
  
  beginShape()
  curveVertex(150,160)
  curveVertex(150,160)
  curveVertex(150-5,140)
  curveVertex(152-1,140)
  curveVertex(154,150)
  curveVertex(156,160-2)
  curveVertex(156,160-2)
  endShape()
  line(148,159+1,158,159-1)
  pop()

  fill(255)
  ellipse(112+1,154,7,12)
  
  beginShape()
  curveVertex(147,148)
  curveVertex(147,148)
  curveVertex(145,139)
  curveVertex(151,141)
  curveVertex(153,146)
  curveVertex(151,149)
  curveVertex(148,150)
  curveVertex(148,150)
  endShape(CLOSE)
  
  line(102,147,108,143)
  line(108,143,118,144)
  
  line(110,149+2,107,154+3)
  line(108,153,106,153)
  line(107,157,105,156+1)
  
  line(138,138,141,134)
  line(141,134,153,134)
  line(145,138,154,142)
  line(151,140,152,137)
  line(154,142,156,138)

}

function miraSurprisedF() {

  fill('lightpink')
  ellipse(139,171+3,13)
  
  push()
  fill(15, 48, 91)
  beginShape()
  curveVertex(118-5,170)
  curveVertex(118-5,170)
  curveVertex(110,160)
  curveVertex(110,150)
  curveVertex(115,148)
  curveVertex(118,160)
  curveVertex(120,170)
  curveVertex(120,170)
  endShape()
  line(115-4,169+2,123,168+2)
  
  
  beginShape()
  curveVertex(150,160)
  curveVertex(150,160)
  curveVertex(150-5,140)
  curveVertex(152-1,140)
  curveVertex(154,150)
  curveVertex(156,160-2)
  curveVertex(156,160-2)
  endShape()
  line(148,159+1,158,159-1)
  pop()

  fill(255)
  ellipse(112+1,154,7,12)
  
  beginShape()
  curveVertex(147,148)
  curveVertex(147,148)
  curveVertex(145,139)
  curveVertex(151,141)
  curveVertex(153,146)
  curveVertex(151,149)
  curveVertex(148,150)
  curveVertex(148,150)
  endShape(CLOSE)
  
  line(102,147,108,143)
  line(108,143,118,144)
  
  line(110,149+2,107,154+3)
  line(108,153,106,153)
  line(107,157,105,156+1)
  
  line(138,138,141,134)
  line(141,134,153,134)
  line(145,138,154,142)
  line(151,140,152,137)
  line(154,142,156,138)

}

function miraDeadF() {

  line(143,170,139,178+1)
  line(137-1,172,146,177)
  
  line(105,153,119,156)
  line(112+1,147+1,109,161)
  
  line(146,136,141,147)
  line(137,135+2,150,145)

}
