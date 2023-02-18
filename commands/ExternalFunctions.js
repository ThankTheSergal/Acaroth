module.exports = {
    FindMember: async function(base, target){
        let tFinal = target.toString().replace(/,/g,' ');
        if(!tFinal) return null;
        let user;
        let h = await base.mentions.members.first();
        if(h){
            return h;
        }
        h = await base.guild.members.fetch();
        user = h.find(m => m.id == tFinal || m.user.username.toLowerCase().startsWith(tFinal));
        if(user){
            return user;
        }
        else{
            user = h.find(m => m.user.username.toLowerCase().match(tFinal) || m.nickname != null && m.nickname.toLowerCase().match(tFinal));
        }
        if(!user){
            return null
        }
        return user
    },
}