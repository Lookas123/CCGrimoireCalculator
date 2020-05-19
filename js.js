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
let spelldisplays = [];
for(i=1; i <=9; i++){
    spelldisplays.push(document.getElementById("spell"+i))
}
function getRegenTime(start, max){
    let a = start;
    let b = 0;
    while(a<max){
        a+=Math.max(0.002,Math.pow(a/Math.max(max,100),0.5))*0.002
        b++;
    }
    return b/30;
}

function averageGFDtime(magic, buffs, gpoc, edifice){
    let a = Math.floor(magic*0.05+3);
    let b = 0;
    let c = 0;
    for(let spell in spells){
        let me = spells[spell];
        if(me.gfd){
            let price = cost(me.base,me.percent/100,magic)/2;
            if(magic>a+price){
                b+=getRegenTime(magic-price-a,magic);
                c++;
            }
        }
    }
    //Stretch time
    let stprice = cost(8,0.2,magic)/2;
    if(magic>a+stprice){
        if(!buffs){
        b+=getRegenTime(magic-stprice-a, magic);
        }
        c++;
    }
    //Spontaneous Edifice
    let seprice = cost(20,0.80,magic)/2;
    if(magic>a+seprice){
        b+=getRegenTime(magic-seprice-a, magic)/2;
        c++;
        if(!edifice){
            b+=getRegenTime(magic-seprice-a, magic)/2;
        }
    }
    //Resurrect Abomination
    let raprice = cost(20,0.1,magic)/2;
    if(magic>a+raprice){
        if(!gpoc){
            b+=getRegenTime(raprice, magic)
        }
        c++;
    }
    return c==0? " Unable to cast":" Average time to recharge magic: "+Math.round(b/c*1000)/1000;
}
function cost(base, percent, magic){
    return Math.floor(base+magic*percent);
}
function getMaxMagic(level, count){
    Math.floor(4+Math.pow(count,0.6)+Math.log((count+(level-1)*10)/15+1)*15);
}
function calculateStuff(){
    let towers = Number(count.value);
    let lvl = Number(level.value);
    let maximum = Number(max.value);
    let buffs = st.checked;
    let edifice = se.checked;
    let gpoc = ra.checked;
    manainfo.innerHTML = "With those numbers, your maximum mana would be "+ Math.floor(4+Math.pow(towers,0.6)+Math.log((towers+(lvl-1)*10)/15+1)*15) +", and the lowest maximum mana you could reach would be " + (5+Math.floor(Math.log((1+(lvl-1)*10)/15+1)*15));
    let i = 0;
    for(spell in spells){
        let me = spells[spell];
        let manacost = cost(me.base, me.percent/100, maximum);
        if(me.customtime){
            spelldisplays[i].innerHTML = me.name+":<br>Mana cost: " + manacost  +"<br>"+ (averageGFDtime(maximum, !buffs, gpoc, edifice));
        }else{
            spelldisplays[i].innerHTML = me.name+":<br>Mana cost: " +  manacost  +"<br>"+ (maximum<manacost? "    Unable to cast":" Recharge time: "+Math.round(getRegenTime(maximum-manacost, maximum)*1000)/1000+" seconds");
        }
        i++;
    }
}
calculateStuff()
/*
let a = 0;
let bestTime = 0;
for(let i=5; i<150; i++){
    let b = averageGFDtime(i, false, false, (i<90)?true:false)
    if((b<bestTime||a==0)
        && 0.65*i>8
        && !isNaN(b)
        ){
        a = i;
        bestTime=b;
        console.log(bestTime + " seconds with a maximum mana of " + a);
    }
}
*/
