const spells ={
    cbg:{
        base:2,
        percent:40,
        gfd:true,
        name:"Conjure Baked Goods"
    },
    fthof:{
        base:10,
        percent:60,
        gfd:true,
        name:"Force the Hand of Fate"
    },
    st:{
        base:8,
        percent:20,
        gfd:false,
        name:"Stretch Time"
    },
    se:{
        base:20,
        percent:75,
        gfd:false,
        name:"Spontaneous Edifice"
    },
    hc:{
        base:10,
        percent:10,
        gfd:true,
        name:"Haggler's charm"
    },
    scp:{
        base:20,
        percent:10,
        gfd:true,
        name:"Summon Crafty Pixies"
    },
    gfd:{
        base:3,
        percent:5,
        gfd:false,
        customtime:true,
        name:"Gambler's fever dream"
    },
    ra:{
        base:20,
        percent:10,
        gfd:false,
        name:"Resurrect Abomination"
    },
    di:{
        base:5,
        percent:20,
        gfd:true,
        name:"Diminish Ineptitude"
    }
}
const lvl = document.getElementById("level");
const count = document.getElementById("count");
const max = document.getElementById("maxmana");
const manainfo = document.getElementById("manainfo");
const st = document.getElementById("Buffs");
const se = document.getElementById("SE");
const ra = document.getElementById("gpoc");
const dogfd = document.getElementById("dogfd");
const multi = document.getElementById("multi");
const gudRGN = document.getElementById("gudRegen");
let fasterRegen = false;
let spelldisplays = [];
for(i=1; i <=9; i++){
    spelldisplays.push(document.getElementById("spell"+i))
}
function getRegenTime(start, max){
    let a = start;
    let b = 0;
    while(a<max){
        curMax = fasterRegen ? Math.ceil(a + 1) : max;
        a+=Math.max(0.002,Math.pow(a/Math.max(curMax,100),0.5))*0.002
        b++;
    }
    return b/30;
}

function averageGFDtime(magic, buffs, gpoc, edifice, layers, extra){
    let a = Math.floor(magic*0.05+3);
    let curMax = Math.ceil(magic-extra)
    let b = 0;
    let c = 0;
    for(let spell in spells){
        let me = spells[spell];
        if(me.gfd){
            let price = cost(me.base,me.percent/100,magic)/2;
            if(curMax>a+price){
                b+=layers>1?averageGFDtime(magic, buffs, gpoc, edifice, layers-1, price+a+extra):getRegenTime(magic-price-a-extra,magic);
                c++;
            }
        }
    }
    //Stretch time
    let stprice = cost(8,0.2,magic)/2;
    if(curMax>a+stprice){
        b+=layers>1?!buffs*averageGFDtime(magic, buffs, gpoc, edifice, layers-1, stprice+a+extra):!buffs*getRegenTime(magic-stprice-a-extra,magic);
        c++;
    }
    //Spontaneous Edifice
    let seprice = cost(20,0.75,magic)/2;
    if(curMax>a+seprice){
        let sebackfire=edifice?0:1
        b+=layers>1?averageGFDtime(magic, buffs, gpoc, edifice, layers-1, seprice+a+extra)/2:getRegenTime(magic-seprice-a-extra,magic)/2;
        c++;
        b+=layers>1?averageGFDtime(magic, buffs, gpoc, edifice, layers-1, extra+(a+seprice)*sebackfire)/2:getRegenTime(magic-((a+seprice)*sebackfire)-extra, magic)/2;
    }
    //Resurrect Abomination
    let raprice = cost(20,0.1,magic)/2;
    if(curMax>a+raprice){
        b+=layers>1?gpoc*averageGFDtime(magic, buffs, gpoc, edifice, layers-1, seprice+a+extra):gpoc*getRegenTime(magic-a-raprice-extra, magic)
        c++;
    }
    if(isNaN(b)) return " Unable to cast";
    return c==0? " Unable to cast":(Number(multi.value)==layers?" Average recharge time: ":0)+Math.round(b/c*1000)/1000;
}
function cost(base, percent, magic){
    return Math.floor(base+magic*percent);
}
function getMaxMagic(level, count){
    Math.floor(4+Math.pow(count,0.6)+Math.log((count+(level-1)*10)/15+1)*15);
}
function calculateStuff(){   
    fasterRegen = gudRGN.checked;
    if(count.value<1)count.value=1;
    let towers = Number(count.value);
    if(lvl.value<1)lvl.value=1;
    let level = Number(lvl.value);
    if(max.value>10000)max.value=10000;
    if(max.value<1)max.value=1;
    let maximum = Number(max.value);
    let buffs = st.checked;
    let edifice = se.checked;
    let gpoc = ra.checked;
    let calcGFD = dogfd.checked;
    if(multi.value>50)multi.value=50;
    if(multi.value<1)multi.value=1;
    let castnum = Number(multi.value);
    let minmana = (5+Math.floor(Math.log((1+(level-1)*10)/15+1)*15));
    manainfo.innerHTML = "With those numbers, your maximum mana would be "+ Math.floor(4+Math.pow(towers,0.6)+Math.log((towers+(level-1)*10)/15+1)*15) +", and the lowest maximum mana you could reach would be " + minmana;
    let i = 0;
    for(spell in spells){
        let me = spells[spell];
        let mana = maximum;
        let manacoststr = "";
        let realmanacost = 0;
        for(let e = castnum; e>0; e--){
            let manacost = cost(me.base, me.percent/100, mana);
            mana-=manacost
            mana = Math.max(mana,minmana);
            manacoststr += manacost;
            realmanacost += Number(manacost);
            if(me.customtime!=undefined) break;
            if(e>1){
                manacoststr+= " + "
            }
        }      
        if(me.customtime){
            if(calcGFD)spelldisplays[i].innerHTML = me.name+":<br>Mana cost: " + manacoststr  +"<br>"+ (averageGFDtime(maximum, !buffs, gpoc, edifice, castnum, 0));
            else spelldisplays[i].innerHTML = me.name+":<br>Not calculating this right now<br> (Due to your settings)";
        }else{
            spelldisplays[i].innerHTML = me.name+":<br>Mana cost: " +  manacoststr  +"<br>"+ (maximum<realmanacost? "    Unable to cast":" Recharge time: "+Math.round(getRegenTime(maximum-realmanacost, maximum)*1000)/1000+" seconds");
        }
        i++;
    }
}
calculateStuff()
