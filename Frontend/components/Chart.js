import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Chart() {
 const data = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Skills Learned',
      data: [2, 5, 8, 12],
      borderColor: 'rgba(99, 102, 241, 1)', // Indigo color
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      tension: 0.4
    }
  ]
};
  return <Line data={data} />;
}
