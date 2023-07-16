export default class Table {
    constructor(ctx, scaleRatio) {
        this.ctx = ctx;
        this.scaleRatio = scaleRatio;
        this.leaders = [];
    }

    draw() {
        const fontSize = 15 * this.scaleRatio;
        const offset = 50 * this.scaleRatio;
        const x = 10 * this.scaleRatio;
        const yStart = 100 * this.scaleRatio;

        let html = `<style>
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        };

                        th, td {
                            border : 1px solid #ddd;
                            padding 8px;
                        }

                        th {
                            padding-top: 12px;
                            padding-bottom: 12px;
                            text-align: left;
                            background-color: #4CAF50;
                            color: white;
                        }
                    </style>`;

        html += '<table><thead><tr><th>Username</th><th>Score</th></tr></thead><tbody>';

        this.leaders.forEach((leader, index) => {
            html += `<tr><td>${index+1}. ${leader.username}</td><td>${leader.score}</td></tr>`;
        });

        html += '</tbody></table>';

        return html;
    }

    updateLeaders(leaders) {
        this.leaders = leaders;
    }
}
