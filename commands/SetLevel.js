module.exports = {
    name: 'setlevel',
    description: 'Sets a user to a specific level. Can be used to remove levels, setting to 0 will automatically unmute user.\nExample: $setlevel Heli 3\nSyntax: <command> <user> <levelToSet>',
    execute(Discord, message, Acaroth, msgArr, punishmentData){
        async function blah(){
            let logDescriptionArr = [];
            let logColour = '#abff87';
            let msTime = Date.now();
            let ex =  require('./ExternalFunctions');
            let reason = message.content.split('-')[1];
            let target = message.content.split('-')[0]
            let newLv = '';
                target = target.split('');
            for(let i = 0; i < target.length; i++){
                newLv = target[target.length - i - 1].match(/(\d+)/);
                if(newLv){
                    target = target.join('');
                    target = target.substr(10).slice(0, -i -2);
                    newLv = newLv[0];
                    break;
                };
            };
            console.log(target);
            let cTarget = await ex.FindMember(message, target, Acaroth);
            let mTable = [600000, 1800000, 2700000, 3600000]; //These number need to be changed later!
            let mTimeTable = [`10 minutes.`,`30 minutes.`,`45 minutes.`,`60 minutes.`];
            let bTable = [43200000, 86400000, 604800000, 2629746000]; //These number need to be changed later!
            let bTimeTable = [`12 hours.`,`1 day.`,`1 week.`,`1 month.`];
            let umt = msTime + mTable[newLv-1];
            let ndc = msTime + 1209600000;  //1209600000
            let ubt = msTime + bTable[newLv-5];
            let logGuild = Acaroth.guilds.cache.find(g => g.id == '834998106398392340');
            let logChannel = logGuild.channels.cache.find(c => c.id == '967603457487958026');
            let mRole = message.guild.roles.cache.find(role => role.id == '843580409681281075');
            if(reason){
                while(reason.startsWith(' ')){
                    reason = reason.substr(1);
                };
                reason = `**Reason:** ${reason}`;
            }else{
                reason = `No reason provided.`
            }
            if(!cTarget){
                return message.reply("Could not find user. Please try again.");
            };
            let pUser = `${cTarget.user.username}#${cTarget.user.discriminator}`
            if(newLv < 0 || newLv > 9 || !newLv){
                return message.reply("Please choose a level between 0 - 9.")
            }
            let pDb = await punishmentData.findOne({where:{uid: cTarget.user.id}})
            let cLevel;
            if(newLv < 5){
                console.log(`New level is less than 5, moving ${pUser} to level ${newLv}.`)
                let uErr = 0;
                if(!pDb){
                    console.log(`No current database, attempting to create one...`)
                    try{
                        pDb = await punishmentData.create({
                            uid:            cTarget.user.id,
                            level:          newLv,
                            unmuteTime:     umt,
                            unbanTime:      -1,
                            decayTime:      ndc,
                            overflow:       0,
                            decayOrigin:    -1,
                            banFlag:        false,
                            isEdited:       true,
                        });
                    }catch(e){
                        uErr = 1;
                        logColour = '#ff6666';
                        logDescriptionArr.push(`Error creating database, plase try again.`);
                    };
                    let rErr = 0;
                    try{
                        if(mRole){
                            await cTarget.roles.add(mRole);
                        }else{
                            rErr = 1
                            logColour = '#ff6666';
                            logDescriptionArr.push(`Role not found, cannot add mute role.`);
                        }
                    }catch(e){
                        rErr = 1;
                        logColour = '#ff6666';
                        let roleErr = e.toString();
                        if(roleErr.match(`Missing Permissions`)){
                            logDescriptionArr.push(`Cannot add role, missing permissions or user has a higher rank.`);
                        }else{
                            console.log(roleErr)
                            logDescriptionArr.push(`Error adding role.`);
                        };
                    }
                    if(uErr == 0){
                        console.log(`Database for ${cTarget.user.username} successfully created.`);
                    };
                }else{
                    cLevel = pDb.dataValues.level;
                    if(cLevel == newLv){
                        return message.reply(`User is already at level ${newLv}.`)
                    }
                    console.log(`Database for user found. Attempting to update...`);
                    try{
                        pDb.update({level: newLv, unmuteTime: umt, isEdited: true});
                    }catch(e){
                        uErr = 1;
                        logColour = '#ff6666';
                        logDescriptionArr.push(`Error updating database, please try again.`);
                    };
                    if(uErr == 0){
                        console.log(`Update successful.`);
                    }
                };
                if(newLv > cLevel){
                    let rErr = 0;
                    try{
                        if(mRole){
                            await cTarget.roles.add(mRole);
                        }else{
                            rErr = 1
                            logColour = '#ff6666';
                            logDescriptionArr.push(`Role not found, cannot add mute role.`);
                        }
                    }catch(e){
                        rErr = 1;
                        logColour = '#ff6666';
                        let roleErr = e.toString();
                        if(roleErr.match(`Missing Permissions`)){
                            logDescriptionArr.push(`Cannot add role, missing permissions or user has a higher rank.`);
                        }else{
                            logDescriptionArr.push(`Error adding role.`);
                        };
                    }
                    if(rErr == 0){
                        logDescriptionArr.push(`Success. They will be unmuted in ${mTimeTable[newLv-1]}`)  
                    };    
                };
                if(newLv == 0){
                    let rErr = 0;
                    let hadRole = 1;
                    try{
                        if(cTarget.roles.cache.find(r => r.id == '843580409681281075')){
                            console.log("hawdhawud")
                            await cTarget.roles.remove(mRole);
                        }else{
                            hadRole = 0;
                        }
                    }catch(e){
                        rErr = 1;
                        logColour = '#ff6666';
                        let roleErr = e.toString();
                        if(roleErr.match(`Missing Permissions`)){
                            logDescriptionArr.push(`Cannot remove role, missing permissions or user has a higher rank.`);
                        }else{
                            console.log(e);
                            logDescriptionArr.push(`Error removing role.`);
                        };
                    };
                    if(rErr == 0){
                        console.log(`${pUser} has been set to level ${newLv}.\n${reason}`);
                        if(hadRole == 1){
                            logDescriptionArr.push(`User has been unmuted.`);
                        }else{
                            logDescriptionArr.push(`User was already unmuted, no roles have been removed.`);
                        }
                    };
                };
            }else if(newLv >= 5){
                if(newLv == 9){
                    let dErr = 0;
                    logDescriptionArr.push(`${pUser} has been set to level 9. Attempting to ban...`);
                    try{
                        await cTarget.ban();
                    }catch(e){
                        dErr = 1;
                        logColour = '#ff6666';
                        logDescriptionArr.push('Cannot ban user at level 9, missing permissions.');
                    }
                    if(dErr == 0){
                        logDescriptionArr.push(`User banned, deleting database...`);
                    }
                    try{
                        await pDb.destroy();
                    }catch(e){
                        dErr = 1;
                        logColour = '#ff6666';
                        logDescriptionArr.push('Error destroying database.');
                    }
                    if(dErr == 0){
                        logDescriptionArr.push(`Successfully deleted user from batabase.`);
                    }
                }
                logDescriptionArr.push(`New level is greater than 5, moving ${pUser} to level ${newLv}, and banning.`);
                if(!pDb){
                    let cErr = 0;
                    logDescriptionArr.push(`No current database, attempting to create one...`)
                    try{
                        let ovf = newLv - 5;
                        pDb = await punishmentData.create({
                            uid:            cTarget.user.id,
                            level:          5,
                            unmuteTime:     ubt,
                            unbanTime:      -1,
                            decayTime:      ndc,
                            overflow:       ovf,
                            decayOrigin:    -1,
                            banFlag:        false,
                            isEdited:       true,
                        });
                    }catch(e){
                        cErr = 1;
                        logColour = '#ff6666';
                        logDescriptionArr.push(`Error creating database, plase try again.`)
                    }
                    if(cErr == 0){
                        logDescriptionArr.push(`Database for ${cTarget.user.username} successfully created. They are now level ${newLv}. And will be unbanned in ${bTimeTable[newLv-5]}`)
                    }
                }else{
                    let uErr = 0;
                    console.log(`Database for user found. Attempting to update to level ${newLv}.`);
                    try{
                        pDb.update({level: newLv, unbanTime: ubt, isEdited: true});
                    }catch(e){
                        uErr = 1;
                        logColour = '#ff6666';
                        logDescriptionArr.push(`Error updating database, please try again.`);
                    };
                    if(uErr == 0){
                        logDescriptionArr.push(`Update successful, ${cTarget.user.username} is now level ${newLv}.`);
                        if(reason){
                            logDescriptionArr.push(`Reason provided: ${reason}`);
                        }
                    }
                }
                let bErr = 0;
                try{
                    await cTarget.ban();
                }catch(e){
                    console.log(e);
                    bErr = 1;
                    logColour = '#ff6666';
                    logDescriptionArr.push(`${pUser} cannot be banned. Missing permissions or they have a higher rank.`);
                }
                if(bErr == 0){
                    logDescriptionArr.push(`${pUser} was banned for reaching level ${newLv}. They will be unbanned in ${bTimeTable[newLv-5]}`)
                }
            }
            if(!cLevel) cLevel = 0;
            let sErr = 0;
            let embColour = '#ff6666';
            let embTitle = `You've been warned in Wyvern's Den.`;
            let preMessage = `${pUser}'s level has been set from ${cLevel} -> ${newLv}. \n${reason}`;
            let warnMessage = `Your current level is ${newLv}.\n${reason}`;
            if(reason != `No reason provided.`){
                preMessage = `${pUser}'s level has been set from ${cLevel} -> ${newLv}. \nAttempting to send warning.\n${reason}`;
            }
            if(newLv == 4){
                preMessage = `${pUser} has reached level 4, DMing them a warning.\n${reason}`;
                warnMessage = `You've reached level 4. Tread carefully, the next warn will result in a ban.\n${reason}`;
            };
            if(newLv < cLevel){
                embColour = '#abff87';
                embTitle = `You've been pardoned in Wyvern's Den.`
                preMessage = `${pUser} has been pardoned.\nLevel reduced from ${cLevel} -> ${newLv}. ${reason}`;
                warnMessage = `You've been pardoned. New level is ${newLv}. \n${reason}`;
            }
            logDescriptionArr.push(preMessage);
            try{
                let warnEmb = new Discord.EmbedBuilder()
                    .setTitle(embTitle)
                    .setDescription(warnMessage)
                    .setColor(embColour)
                    .setFooter({text: 'DM this bot for any concerns.'})
                await cTarget.send({embeds: [warnEmb]});
            }catch(e){
                console.log(e);
                sErr = 1;
                logColour = '#ff6666';
                logDescriptionArr.push(`Error sending warning to user.`);
            }
            if(sErr == 0){
                console.log(`Warning sent successfully.`);
            }
            logDescriptionArr = logDescriptionArr.join('\n');
            let logEmb = new Discord.EmbedBuilder()
                .setColor(logColour)
                .setDescription(logDescriptionArr)
            logChannel.send({ embeds: [logEmb]})
            if(logColour == '#ff6666'){
                let repEmb = new Discord.EmbedBuilder()
                    .setColor(logColour)
                    .setDescription(`Possible error setting level of ${pUser}, check ${logChannel} for specific details.`)
                return message.reply({embeds: [repEmb]});
            }else{
                let repEmb = new Discord.EmbedBuilder()
                    .setColor(logColour)
                    .setDescription(`${pUser}'s level has been set to ${newLv}.`)
                return message.reply({embeds: [repEmb]});
            }
        }
        if(message.member.permissions.has('ManageRoles')){
            blah();
        }else{
            let txt = `Woah, let's not get carried away here. You don't have permissions, *maybe* just maybe, if you suck an admin's dick you can get them. Not my choice though.`
            return message.reply({
                content: txt,
                files: [{
                    attachment: './Images/Shrug.png',
                    name: 'Shrug.png',
                    description: 'Shrug.'
                    }]
                });
        };
    }
}