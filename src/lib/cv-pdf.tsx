import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CvDocument } from "@/lib/cv-types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 36,
    paddingBottom: 30,
    fontSize: 10,
    color: "#111827",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontFamily: "Times-Roman",
  },
  headline: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 3,
    color: "#4b5563",
  },
  contact: {
    fontSize: 9,
    marginTop: 5,
    color: "#6b7280",
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.45,
    color: "#374151",
  },
  entry: {
    marginBottom: 7,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 2,
  },
  period: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  bullet: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.35,
    marginTop: 3,
  },
});

const splitDetails = (details: string) =>
  details
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function CvPdfDocument({ cv }: { cv: CvDocument }) {
  return (
    <Document title={`${cv.fullName} - CV`} language="en">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{cv.fullName}</Text>
          <Text style={styles.headline}>{cv.headline}</Text>
          <Text style={styles.contact}>
            {cv.email} | {cv.phone} | {cv.location}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.paragraph}>{cv.summary}</Text>
        </View>

        {cv.sections.map((section) => (
          <View style={styles.section} key={section.id}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <View key={item.id} style={styles.entry}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
                  </View>
                  {item.period ? <Text style={styles.period}>{item.period}</Text> : null}
                </View>
                {splitDetails(item.details).map((line) => (
                  <Text key={line} style={styles.bullet}>
                    - {line}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
