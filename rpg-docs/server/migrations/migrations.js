Migrations.add({
	version: 1,
	name: "converts effect proficiencies to proficiency objects, removes types from assets",
	up: function() {
		//convert proficiency effects to proficiency objects
		Effects.find({operation: "proficiency"}).forEach(function(effect){
			var type = "skill";
			if (_.contains(SAVES, effect.stat)) type = "save";
			Proficiencies.insert({
				charId: effect.charId,
				name: effect.stat,
				value: effect.value,
				parent: _.clone(effect.parent),
				type: type,
				enabled: effect.enabled,
			}, function(err){
				if (!err) Effects.remove(effect._id);
			});
		});
		//store type as a parent group if it's needed
		Effects.find({"parent.collection": "Characters"}).forEach(function(e){
			Effects.update(e._id, {$set: {"parent.group": e.type}});
		});
		Attacks.find({"parent.collection": "Characters"}).forEach(function(a){
			Attacks.update(a._id, {$set: {"parent.group": a.type}});
		});
		//remove type
		Effects.update({}, {$unset: {type: ""}}, {validate: false, multi: true});
		Attacks.update({}, {$unset: {type: ""}}, {validate: false, multi: true});
		//remove languages and proficiencies
		Characters.update(
			{},
			{$unset: {languages: "", proficiencies: ""}},
			{validate: false, multi: true}
		);
	},
});