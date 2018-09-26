const ranks = [
    { points: 0, title: 'Schnupperninja' },
    { points: 10, title: 'Anwärter' },
    { points: 100, title: 'Akademie Schüler' },
    { points: 200, title: 'Genin' },
    { points: 500, title: 'Chunin' },
    { points: 700, title: 'Jonin' },
    { points: 1000, title: 'Anbu' },
    { points: 1500, title: 'Spezial-Anbu' },
    { points: 2000, title: 'Medizin Ninja' },
    { points: 3000, title: 'Sannin' },
    { points: 4000, title: 'Ninja Meister' },
    { points: 6000, title: 'Kage' },
    { points: 8000, title: 'Hokage' },
    { points: 10000, title: 'Otaku' },
    { points: 11000, title: 'Otaku no Senpai' },
    { points: 12000, title: 'Otaku no Sensei' },
    { points: 14000, title: 'Otaku no Shihan' },
    { points: 16000, title: 'Hikikomori' },
    { points: 18000, title: 'Halbgott' },
    { points: 20000, title: 'Kami-Sama' }
];

angular.module('proxtop').service('ProgressService', function() {
    this.getNextRank = (points = 0) => {
        return _.find(ranks, (rank) => rank.points > points);
    };

    this.getCurrentRank = (points = 0) => {
        for(var i = 1; i < ranks.length; i++) {
            const curr = ranks[i];
            if(curr.points > points) {
                return ranks[i - 1];
            }
        }
        return ranks[0];
    };

    this.getProgressToNextRank = (points = 0) => {
        const nextRank = this.getNextRank(points);
        const currRank = this.getCurrentRank(points);
        const progression = points - currRank.points;
        const required = nextRank.points - currRank.points;
        return progression / required;
    };
});
